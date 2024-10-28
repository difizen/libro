import { CloseOutlined } from '@ant-design/icons';
import {
  LibroContextKey,
  LibroSlotManager,
  LibroSlotView,
} from '@difizen/libro-jupyter';
import type { DisplayView, LibroView } from '@difizen/libro-jupyter';
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

import { LibroAINativeService } from './ai-native-service.js';
import { LibroAiNativeChatView } from './libro-ai-native-chat-view.js';
import type { AiNativeChatViewOption } from './protocol.js';

export const ChatRender = () => {
  const containRef = useRef<HTMLDivElement>(null);
  const libroChatView = useInject<LibroChatView>(ViewInstance);
  const libroSlotManager = useInject<LibroSlotManager>(LibroSlotManager);
  const libroContextKey = useInject<LibroContextKey>(LibroContextKey);
  const libroAINativeService = useInject<LibroAINativeService>(LibroAINativeService);
  return (
    <div
      className="chat-container"
      ref={containRef}
      onFocus={() => {
        libroContextKey.disableCommandMode();
      }}
      onBlur={() => {
        libroContextKey.enableCommandMode();
      }}
    >
      <div className="chat-header">
        <div className="chat-title">Libro AI</div>
        <div className="chat-right-toolbar">
          <div className="chat-type">
            {libroChatView.chatView?.isCellChat ? 'Focused Cell' : 'General Chat'}
          </div>
          <div>
            <CloseOutlined
              className="chat-close-icon"
              onClick={() => {
                if (libroChatView.parent) {
                  if (libroChatView.chatView?.cell?.className) {
                    libroChatView.chatView.cell.className =
                      libroChatView.chatView.cell?.className.replace(
                        'ai-cell-focus',
                        '',
                      );
                  }

                  libroAINativeService.showChatMap.set(libroChatView.parent.id, false);
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
      {libroChatView.chatView && (
        <ViewRender view={libroChatView.chatView}></ViewRender>
      )}
    </div>
  );
};

@transient()
@view('libro-chat-view')
export class LibroChatView extends BaseView implements DisplayView {
  parent: LibroView | undefined = undefined;
  protected configurationService: ConfigurationService;
  @inject(ViewManager) viewManager: ViewManager;

  override view = ChatRender;

  @prop()
  chatView: LibroAiNativeChatView;

  @prop()
  isDisplay = true;

  setAINativeChatView(option: AiNativeChatViewOption) {
    if (this.chatView?.cell) {
      this.chatView.cell.className = this.chatView.cell.className?.replace(
        'ai-cell-focus',
        '',
      );
    }
    this.viewManager
      .getOrCreateView(LibroAiNativeChatView, option)
      .then((chatView) => {
        chatView.libro = this.parent;
        if (option.isCellChat) {
          chatView.cell = option.cell;
        }
        this.chatView = chatView;
        return;
      })
      .catch(() => {
        //
      });
  }
}
