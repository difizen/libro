import type { CellView, LibroView } from '@difizen/libro-jupyter';
import { ChatView } from '@difizen/magent-chat';
import { inject, prop, transient, view, ViewOption } from '@difizen/mana-app';
import breaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import { CodeBlockInChat } from './ai-native-code-block.js';
import './index.less';
import type { AiNativeChatViewOption } from './protocol.js';
import { ImageModal } from './utils.js';

const viewId = 'magent-chat';

@transient()
@view(viewId)
export class LibroAiNativeChatView extends ChatView {
  @prop()
  isCellChat = false;

  libro?: LibroView;

  cell?: CellView;

  constructor(@inject(ViewOption) option: AiNativeChatViewOption) {
    super(option);
    this.option = option;
    this.isCellChat = option.isCellChat;
  }

  override getMarkdownProps() {
    return {
      components: { code: CodeBlockInChat, img: ImageModal },
      remarkPlugins: [remarkGfm, breaks],
    };
  }

  protected override toMessageOption(msgContent: string) {
    if (this.isCellChat) {
      return {
        stream: true,
        ...this.option,
        sender: { type: 'HUMAN' },
        input: msgContent,
        system_prompt: `有如下的代码作为对话的上下文：${this.cell?.model.value}`,
      };
    }
    return {
      stream: true,
      ...this.option,
      sender: { type: 'HUMAN' },
      input: msgContent,
    };
  }
}
