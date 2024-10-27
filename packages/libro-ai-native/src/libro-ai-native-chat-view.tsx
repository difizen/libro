import type { LibroView } from '@difizen/libro-jupyter';
import { ChatView } from '@difizen/magent-chat';
import { prop, transient, view } from '@difizen/mana-app';
import './index.less';

const viewId = 'magent-chat';

@transient()
@view(viewId)
export class LibroAiNativeChatView extends ChatView {
  @prop()
  isCellChat = false;

  libro?: LibroView;

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
