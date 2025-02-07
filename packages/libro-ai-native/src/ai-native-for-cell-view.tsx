import { CloseOutlined } from '@ant-design/icons';
import type { CellView } from '@difizen/libro-jupyter';
import type { IChatMessage } from '@difizen/magent-chat';
import { AnswerState } from '@difizen/magent-chat';
import { ChatComponents } from '@difizen/magent-chat';
import { ChatEvent } from '@difizen/magent-chat';
import type { ToAutoFactory } from '@difizen/magent-core';
import { Fetcher } from '@difizen/magent-core';
import { toAutoFactory } from '@difizen/magent-core';
import type { ViewComponent } from '@difizen/libro-common/mana-app';
import { ViewOption } from '@difizen/libro-common/mana-app';
import { prop } from '@difizen/libro-common/mana-app';
import { useObserve } from '@difizen/libro-common/mana-app';
import { useInject, ViewInstance } from '@difizen/libro-common/mana-app';
import { inject } from '@difizen/libro-common/mana-app';
import { BaseView, transient, view } from '@difizen/libro-common/mana-app';
import { l10n } from '@difizen/libro-common/mana-l10n';
import { Button } from 'antd';
import type { ParsedEvent } from 'eventsource-parser/stream';
import { EventSourceParserStream } from 'eventsource-parser/stream';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import breaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css'; // 引入 KaTeX 样式

import { CodeBlockInCell } from './ai-native-code-block.js';
import { LibroAINativeService } from './ai-native-service.js';
import { AILoadding } from './icon.js';
import { LibroAIChatMessageItemModel } from './libro-ai-msg-item-model.js';
import type { IAINativeForCellViewOption } from './protocol.js';
import { cancelCellAIClassname, stringToReadableStream } from './utils.js';

export function LibroAINativeForCellRender() {
  const LLMRender = ChatComponents.Markdown;

  const instance = useInject<LibroAINativeForCellView>(ViewInstance);
  const libroAINativeService = useInject<LibroAINativeService>(LibroAINativeService);

  const msgItem = useObserve(instance.libroAIChatMessageItemModel);

  if (!instance.showAI) {
    return null;
  }

  return (
    <div className="libro-ai-native-for-cell-container">
      {msgItem?.state === AnswerState.FAIL ? (
        <div className="libro-ai-native-for-cell-error">{l10n.t('请求报错～')}</div>
      ) : (
        <LLMRender
          type="message"
          components={{ code: CodeBlockInCell }}
          remarkPlugins={[remarkGfm, breaks]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
        >
          {msgItem?.content || ''}
        </LLMRender>
      )}
      <Button
        color="default"
        variant="outlined"
        className={`libro-ai-native-for-cell-cancel-btn ${msgItem?.state === AnswerState.FAIL ? 'error' : ''}`}
        onClick={() => {
          instance.showAI = false;
          if (!libroAINativeService.cellAIChatMap.get(instance.cell.id)) {
            cancelCellAIClassname(instance.cell);
          }
        }}
        icon={
          msgItem?.state === AnswerState.SUCCESS ||
          msgItem?.state === AnswerState.FAIL ? (
            <CloseOutlined />
          ) : (
            <AILoadding />
          )
        }
      >
        {l10n.t('取消')}
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
    const { chat_key, content, language } = option;

    const url = `/libro/api/chatstream`;
    const msg = {
      chat_key: chat_key,
      prompt: encodeURIComponent(content),
      language: language,
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
        sender: { type: 'AI', id: 'libro' },
        content: '',
      });
      this.libroAIChatMessageItemModel = msgItem;
      let alreayDone = false;
      let error: ParsedEvent = { data: '', type: 'event' };
      try {
        while (!alreayDone) {
          const { value, done } = await reader.read();
          if (value) {
            error = value;
          }
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
      } catch {
        console.error('libro-ai-error:' + error.data);
        msgItem.handleEventData({
          type: 'error',
        });
      }
      return;
    }
  };
}
