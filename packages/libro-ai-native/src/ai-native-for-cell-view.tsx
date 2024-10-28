import { CloseOutlined } from '@ant-design/icons';
import type { CellView } from '@difizen/libro-jupyter';
import type { IChatMessage } from '@difizen/magent-chat';
import { AnswerState } from '@difizen/magent-chat';
import { ChatComponents } from '@difizen/magent-chat';
import { ChatEvent } from '@difizen/magent-chat';
import type { ToAutoFactory } from '@difizen/magent-core';
import { Fetcher } from '@difizen/magent-core';
import { toAutoFactory } from '@difizen/magent-core';
import type { ViewComponent } from '@difizen/mana-app';
import { ViewOption } from '@difizen/mana-app';
import { prop } from '@difizen/mana-app';
import { useObserve } from '@difizen/mana-app';
import { useInject, ViewInstance } from '@difizen/mana-app';
import { inject } from '@difizen/mana-app';
import { BaseView, transient, view } from '@difizen/mana-app';
import { Button } from 'antd';
import { EventSourceParserStream } from 'eventsource-parser/stream';
import breaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import { CodeBlockInCell } from './ai-native-code-block.js';
import { AILoadding } from './icon.js';
import { LibroAIChatMessageItemModel } from './libro-ai-msg-item-model.js';
import type { IAINativeForCellViewOption } from './protocol.js';
import { stringToReadableStream } from './utils.js';

export function LibroAINativeForCellRender() {
  const LLMRender = ChatComponents.Markdown;

  const instance = useInject<LibroAINativeForCellView>(ViewInstance);
  const msgItem = useObserve(instance.libroAIChatMessageItemModel);
  if (!instance.showAI) {
    return null;
  }
  return (
    <div className="libro-ai-native-for-cell-container">
      <LLMRender
        type="message"
        components={{ code: CodeBlockInCell }}
        remarkPlugins={[remarkGfm, breaks]}
      >
        {msgItem?.content || ''}
      </LLMRender>
      <Button
        color="default"
        variant="outlined"
        className="libro-ai-native-for-cell-cancel-btn"
        onClick={() => {
          instance.showAI = false;
          instance.cell.parent.model.libroViewClass =
            instance.cell.parent.model.libroViewClass.replace('ai-cell-chat', '');
        }}
        icon={
          msgItem?.state === AnswerState.SUCCESS ? <CloseOutlined /> : <AILoadding />
        }
      >
        取消
      </Button>
    </div>
  );
}

@transient()
@view('libro-ai-native-for-cell-view')
export class LibroAINativeForCellView extends BaseView {
  override view: ViewComponent = LibroAINativeForCellRender;
  @inject(Fetcher) fetcher: Fetcher;
  cell: CellView;
  @inject(toAutoFactory(LibroAIChatMessageItemModel))
  libroAiChatMessageItemFactory: ToAutoFactory<typeof LibroAIChatMessageItemModel>;
  @prop()
  libroAIChatMessageItemModel?: LibroAIChatMessageItemModel;

  @prop()
  showAI = false;
  constructor(@inject(ViewOption) options: IAINativeForCellViewOption) {
    super();
    this.cell = options.cell;
  }

  chatStream = async (option: IChatMessage) => {
    const { chat_key, content } = option;

    const url = `/libro/api/chatstream`;
    const msg = {
      chat_key: chat_key,
      prompt: content,
    };
    const res = await this.fetcher.post<ReadableStream<Uint8Array>>(url, msg, {
      headers: {
        Accept: 'text/event-stream',
      },
      responseType: 'stream',
      adapter: 'fetch',
    });
    if (res.status === 200) {
      let reader;
      if (typeof res.data === 'string') {
        reader = stringToReadableStream(res.data)
          .pipeThrough(new TextDecoderStream())
          .pipeThrough(new EventSourceParserStream())
          .getReader();
      } else {
        const stream = res.data;
        reader = stream
          .pipeThrough(new TextDecoderStream())
          .pipeThrough(new EventSourceParserStream())
          .getReader();
      }
      const msgItem = this.libroAiChatMessageItemFactory({
        sender: { type: 'AI', id: chat_key },
        content: '',
      });
      this.libroAIChatMessageItemModel = msgItem;
      let alreayDone = false;
      while (!alreayDone) {
        const { value, done } = await reader.read();
        if (done) {
          alreayDone = true;
          msgItem.handleEventData({
            type: 'done',
          });

          break;
        }
        const data = JSON.parse(value.data);
        const event = ChatEvent.format(value.event || 'chunk', data);
        msgItem.handleEventData(event);
      }
      return;
    }
  };
}
