import type { LibroView } from '@difizen/libro-jupyter';
import { ChatView } from '@difizen/magent-chat';
import { prop, transient, view } from '@difizen/mana-app';
import breaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import { CodeBlockInChat } from './ai-native-code-block.js';
import './index.less';
import { ImageModal } from './utils.js';

const viewId = 'magent-chat';

@transient()
@view(viewId)
export class LibroAiNativeChatView extends ChatView {
  @prop()
  isCellChat = false;

  libro?: LibroView;

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
        system_prompt: `有如下的代码作为对话的上下文：${this.libro?.activeCell?.model.value}`,
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
