import { CommentOutlined } from '@ant-design/icons';
import {
  LibroCommandRegister,
  LibroSlotManager,
  LibroSlotView,
  LibroToolbarArea,
  LibroCellView,
  LibroView,
} from '@difizen/libro-jupyter';
import type { CommandRegistry, ToolbarRegistry } from '@difizen/mana-app';
import { inject } from '@difizen/mana-app';
import { CommandContribution } from '@difizen/mana-app';
import { singleton, ToolbarContribution, ViewManager } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';

import { AINativeCommands } from './ai-native-command.js';
import { LibroAINativeService } from './ai-native-service.js';
import { AIToolbarSelector } from './ai-side-toolbar-selector.js';
import { LibroAIChatSlotContribution } from './chat-slot-contribution.js';
import { AIIcon } from './icon.js';
import { addCellAIClassname } from './utils.js';

@singleton({ contrib: [CommandContribution, ToolbarContribution] })
export class LibroAINativeCommandContribution
  implements ToolbarContribution, CommandContribution
{
  @inject(LibroCommandRegister) protected readonly libroCommand: LibroCommandRegister;
  @inject(LibroAIChatSlotContribution)
  libroAIChatSlotContribution: LibroAIChatSlotContribution;
  @inject(LibroSlotManager) libroSlotManager: LibroSlotManager;
  @inject(LibroAINativeService) libroAINativeService: LibroAINativeService;
  @inject(ViewManager) viewManager: ViewManager;

  registerToolbarItems(registry: ToolbarRegistry): void {
    registry.registerItem({
      id: AINativeCommands['AISideToolbarSelect'].id,
      command: AINativeCommands['AISideToolbarSelect'].id,
      icon: AIToolbarSelector,
      showLabelInline: true,
      order: 'b',
    });
    registry.registerItem({
      id: AINativeCommands['Chat'].id,
      command: AINativeCommands['Chat'].id,
      icon: AIIcon,
      order: 'a',
    });

    registry.registerItem({
      id: AINativeCommands['CellChat'].id,
      command: AINativeCommands['CellChat'].id,
      icon: <CommentOutlined className="libro-ai-native-cell-chat-icon" />,
      order: 'a',
    });
  }

  registerCommands(command: CommandRegistry): void {
    this.libroCommand.registerLibroCommand(
      command,
      AINativeCommands['AISideToolbarSelect'],
      {
        execute: async () => {
          // this.libroService.active?.enterEditMode();
        },
        isVisible: (cell, libro, path) => {
          if (!cell || !libro || !(libro instanceof LibroView)) {
            return false;
          }
          return path === LibroToolbarArea.CellRight;
        },
        isEnabled: (cell, libro) => {
          if (!libro || !(libro instanceof LibroView)) {
            return false;
          }
          return true;
        },
      },
    );

    this.libroCommand.registerLibroCommand(command, AINativeCommands['CellChat'], {
      execute: async (cell, libro) => {
        if (!libro || !cell) {
          return;
        }
        addCellAIClassname(cell);
        const chatView = this.libroAINativeService.chatViewMap.get(libro.id);
        const showChat = this.libroAINativeService.showChatMap.get(libro.id);
        if (chatView) {
          chatView.setAINativeChatView({
            id: cell.id,
            isCellChat: true,
            cell: cell,
          });
          if (showChat) {
            return;
          }
          this.libroAINativeService.showChatMap.set(libro.id, !showChat);
          this.libroAINativeService.cellAIChatMap.set(cell.id, !showChat);
          this.libroSlotManager.slotViewManager.addView(
            chatView,
            this.libroSlotManager.getSlotName(
              libro,
              this.libroAIChatSlotContribution.slot,
            ),
            {
              reveal: true,
              order: 'a',
            },
          );
        }
        //优化交互，用于控制点击按钮后菜单消失
        this.libroAINativeService.showSideToolbar = false;
      },
      isEnabled: (cell, libro) => {
        if (!libro || !(libro instanceof LibroView)) {
          return false;
        }
        return true;
      },
      isVisible: (cell, libro, path) => {
        if (!cell || !libro || !(libro instanceof LibroView)) {
          return false;
        }
        return path === LibroToolbarArea.CellRight;
      },
    });
    this.libroCommand.registerLibroCommand(command, AINativeCommands['Chat'], {
      execute: async (cell, libro) => {
        if (!libro || !(libro instanceof LibroView)) {
          return;
        }
        const chatView = this.libroAINativeService.chatViewMap.get(libro.id);
        const showChat = this.libroAINativeService.showChatMap.get(libro.id);
        this.libroAINativeService.showChatMap;
        if (chatView) {
          if (showChat && chatView.chatView.isCellChat) {
            chatView.setAINativeChatView({
              id: libro.id,
              isCellChat: false,
            });
            return;
          }
          chatView.setAINativeChatView({
            id: libro.id,
            isCellChat: false,
          });
          this.libroAINativeService.showChatMap.set(libro.id, !showChat);
          if (showChat) {
            const slotview = this.libroSlotManager.slotViewManager.getSlotView(
              this.libroSlotManager.getSlotName(libro, 'right'),
            );
            if (slotview instanceof LibroSlotView) {
              slotview.revertActive();
            }
          } else {
            this.libroSlotManager.slotViewManager.addView(
              chatView,
              this.libroSlotManager.getSlotName(
                libro,
                this.libroAIChatSlotContribution.slot,
              ),
              {
                reveal: true,
                order: 'a',
              },
            );
          }
        }
        this.libroAINativeService.showSideToolbar = false;
      },
      isVisible: (cell, libro, path) => {
        if (!cell || !libro || !(libro instanceof LibroView)) {
          return false;
        }
        return path === LibroToolbarArea.HeaderRight;
      },
      isEnabled: (cell, libro) => {
        if (!libro || !(libro instanceof LibroView)) {
          return false;
        }
        return true;
      },
    });
    this.libroCommand.registerLibroCommand(command, AINativeCommands['Explain'], {
      execute: async (cell, libro) => {
        if (
          !cell ||
          !(cell instanceof LibroCellView) ||
          !libro ||
          !(libro instanceof LibroView)
        ) {
          return;
        }
        const libroAINativeForCellView =
          await this.libroAINativeService.getOrCreateLibroAINativeForCellView(
            cell.id,
            cell,
          );
        libroAINativeForCellView.showAI = true;
        addCellAIClassname(cell);
        libroAINativeForCellView.chatStream({
          content:
            l10n.getLang() === 'en-US'
              ? `Could you please explain this piece of code?：${cell.model.value}，Provide the reasons and the results of the optimization.`
              : `帮忙优化一下这段代码：${cell.model.value}，给出原因以及优化结果`,
        });
        // this.libroService.active?.enterEditMode();
      },
      isEnabled: (cell, libro) => {
        if (!libro || !(libro instanceof LibroView)) {
          return false;
        }
        return true;
      },
    });

    this.libroCommand.registerLibroCommand(command, AINativeCommands['Optimize'], {
      execute: async (cell, libro) => {
        if (
          !cell ||
          !(cell instanceof LibroCellView) ||
          !libro ||
          !(libro instanceof LibroView)
        ) {
          return;
        }
        const libroAINativeForCellView =
          await this.libroAINativeService.getOrCreateLibroAINativeForCellView(
            cell.id,
            cell,
          );
        libroAINativeForCellView.showAI = true;
        addCellAIClassname(cell);
        libroAINativeForCellView.chatStream({
          content:
            l10n.getLang() === 'en-US'
              ? `Please help optimize this piece of code: ${cell.model.value},provide reasons and the optimized result.`
              : `帮忙优化一下这段代码：${cell.model.value}，给出原因以及优化结果`,
        });
        // this.libroService.active?.enterEditMode();
      },
      isEnabled: (cell, libro) => {
        if (!libro || !(libro instanceof LibroView)) {
          return false;
        }
        return true;
      },
    });
  }
}
