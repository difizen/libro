import { CloseOutlined } from '@ant-design/icons';
import { LibroSlotManager, LibroSlotView } from '@difizen/libro-jupyter';
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

import { LibroAIChatSlotContribution } from './chat-slot-contribution.js';

export const ChatRender = () => {
  const containRef = useRef<HTMLDivElement>(null);
  const libroChatView = useInject<LibroChatView>(ViewInstance);
  const libroSlotManager = useInject<LibroSlotManager>(LibroSlotManager);
  const libroAIChatSlotContribution = useInject<LibroAIChatSlotContribution>(
    LibroAIChatSlotContribution,
  );
  return (
    <div className="chat-container" ref={containRef}>
      <div className="chat-header">
        <div className="chat-title">Libro AI</div>
        <div className="chat-right-toolbar">
          <div className="chat-type">{libroChatView.chatType}</div>
          <div>
            <CloseOutlined
              className="chat-close-icon"
              onClick={() => {
                if (libroChatView.parent) {
                  libroChatView.parent.model.libroViewClass =
                    libroChatView.parent.model.libroViewClass.replace(
                      'ai-cell-chat',
                      '',
                    );

                  libroAIChatSlotContribution.showChatMap.set(
                    libroChatView.parent.id,
                    false,
                  );
                  const slotview = libroSlotManager.slotViewManager.getSlotView(
                    libroSlotManager.getSlotName(libroChatView.parent, 'right'),
                  );
                  if (slotview instanceof LibroSlotView) {
                    slotview.revertActive();
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      <ViewRender view={libroChatView.generalChatView}></ViewRender>
    </div>
  );
};

@transient()
@view('libro-chat-view')
export class LibroChatView extends BaseView implements DisplayView {
  parent: LibroView | undefined = undefined;
  protected configurationService: ConfigurationService;

  override view = ChatRender;

  generalChatView: ChatView;

  cellChatView: ChatView;

  chatType = 'General Chat';

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
        this.generalChatView = chatView;
        return;
      })
      .catch(() => {
        //
      });
  }

  createGeneralChatView() {
    return;
  }
}
