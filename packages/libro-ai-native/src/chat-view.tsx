import { CloseOutlined } from '@ant-design/icons';
import {
  LibroContextKey,
  LibroSlotManager,
  LibroSlotView,
} from '@difizen/libro-jupyter';
import type { DisplayView, LibroView } from '@difizen/libro-jupyter';
import type { ConfigurationService } from '@difizen/libro-common/mana-app';
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
} from '@difizen/libro-common/mana-app';
import { useRef } from 'react';
import 'katex/dist/katex.min.css'; // 引入 KaTeX 样式

import { LibroAINativeService } from './ai-native-service.js';
import { LibroAiNativeChatView } from './libro-ai-native-chat-view.js';
import type { AiNativeChatViewOption } from './protocol.js';
import { cancelCellAIClassname } from './utils.js';

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
              onClick={async () => {
                if (libroChatView.parent) {
                  if (libroChatView.chatView?.cell) {
                    const libroAINativeForCellView =
                      await libroAINativeService.getOrCreateLibroAINativeForCellView(
                        libroChatView.chatView.cell.id,
                        libroChatView.chatView.cell,
                      );
                    if (!libroAINativeForCellView.showAI) {
                      cancelCellAIClassname(libroChatView.chatView.cell);
                      libroAINativeService.cellAIChatMap.set(
                        libroChatView.chatView.cell.id,
                        false,
                      );
                    }
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
  @inject(LibroAINativeService) libroAINativeService: LibroAINativeService;

  override view = ChatRender;

  @prop()
  chatView: LibroAiNativeChatView;

  @prop()
  isDisplay = true;

  async setAINativeChatView(option: AiNativeChatViewOption) {
    if (this.chatView?.cell) {
      if (this.chatView?.cell.id === option.cell?.id) {
        return;
      }
      const libroAINativeForCellView =
        await this.libroAINativeService.getOrCreateLibroAINativeForCellView(
          this.chatView.cell.id,
          this.chatView.cell,
        );

      if (
        this.libroAINativeService.cellAIChatMap.get(this.chatView.cell.id) &&
        !libroAINativeForCellView.showAI
      ) {
        cancelCellAIClassname(this.chatView.cell);
        this.libroAINativeService.cellAIChatMap.set(this.chatView.cell.id, false);
      }
    }

    this.viewManager
      .getOrCreateView(LibroAiNativeChatView, option)
      .then((chatView) => {
        chatView.libro = this.parent;
        if (option.isCellChat && option.cell) {
          chatView.cell = option.cell;
          this.libroAINativeService.cellAIChatMap.set(option.cell.id, true);
        }
        this.chatView = chatView;
        return;
      })
      .catch(() => {
        //
      });
  }
}
