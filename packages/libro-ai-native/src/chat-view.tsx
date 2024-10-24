import type { DisplayView, LibroView } from '@difizen/libro-jupyter';
import { ChatView } from '@difizen/magent-chat';
import type { ConfigurationService } from '@difizen/mana-app';
import {
  BaseView,
  prop,
  transient,
  view,
  inject,
  ViewManager,
  useInject,
  ViewInstance,
  ViewRender,
} from '@difizen/mana-app';
import { useRef } from 'react';

export const ChatRender = () => {
  const containRef = useRef<HTMLDivElement>(null);
  const libroChatView = useInject<LibroChatView>(ViewInstance);
  return (
    <div className="chat-container" ref={containRef}>
      <ViewRender view={libroChatView.chatView}></ViewRender>
    </div>
  );
};

@transient()
@view('libro-chat-view')
export class LibroChatView extends BaseView implements DisplayView {
  parent: LibroView | undefined = undefined;
  protected configurationService: ConfigurationService;

  override view = ChatRender;

  chatView: ChatView;

  @prop()
  isDisplay = true;

  constructor(@inject(ViewManager) viewManager: ViewManager) {
    super();
    viewManager
      .getOrCreateView(ChatView, {
        id: this.id,
        chat_key: 'LLM:chatgpt',
      })
      .then((chatView) => {
        this.chatView = chatView;
        return;
      })
      .catch(() => {
        //
      });
  }
}
