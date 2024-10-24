import {
  LibroCommandRegister,
  LibroSlotManager,
  LibroSlotView,
  LibroToolbarArea,
  LibroView,
} from '@difizen/libro-jupyter';
import type { CommandRegistry, ToolbarRegistry } from '@difizen/mana-app';
import { inject } from '@difizen/mana-app';
import { CommandContribution } from '@difizen/mana-app';
import { singleton, ToolbarContribution } from '@difizen/mana-app';

import { AINativeCommands } from './ai-native-command.js';
import { AIToolbarSelector } from './ai-side-toolbar-selector.js';
import { LibroAIChatSlotContribution } from './chat-slot-contribution.js';
import { AIIcon } from './icon.js';

@singleton({ contrib: [CommandContribution, ToolbarContribution] })
export class LibroAINativeCommandContribution
  implements ToolbarContribution, CommandContribution
{
  @inject(LibroCommandRegister) protected readonly libroCommand: LibroCommandRegister;
  @inject(LibroAIChatSlotContribution)
  libroAIChatSlotContribution: LibroAIChatSlotContribution;
  @inject(LibroSlotManager) libroSlotManager: LibroSlotManager;
  registerToolbarItems(registry: ToolbarRegistry): void {
    registry.registerItem({
      id: AINativeCommands['AISideToolbarSelect'].id,
      command: AINativeCommands['AISideToolbarSelect'].id,
      icon: AIToolbarSelector,
      showLabelInline: true,
      group: ['group2'],
      order: 'a',
    });
    registry.registerItem({
      id: AINativeCommands['Chat'].id,
      command: AINativeCommands['Chat'].id,
      icon: AIIcon,
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
    this.libroCommand.registerLibroCommand(command, AINativeCommands['Chat'], {
      execute: async (cell, libro) => {
        if (!libro) {
          return;
        }
        const chatView = this.libroAIChatSlotContribution.viewMap.get(libro.id);
        const showChat = !this.libroAIChatSlotContribution.showChatMap.get(libro.id);
        this.libroAIChatSlotContribution.showChatMap.set(libro.id, showChat);

        this.libroAIChatSlotContribution.showChatMap;
        if (chatView) {
          if (showChat) {
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
          } else {
            const slotview = this.libroSlotManager.slotViewManager.getSlotView(
              this.libroSlotManager.getSlotName(libro, 'right'),
            );
            if (slotview instanceof LibroSlotView) {
              slotview.revertActive();
            }
          }
        }
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
      execute: async () => {
        // this.libroService.active?.enterEditMode();
      },
      isEnabled: (cell, libro) => {
        if (!libro || !(libro instanceof LibroView)) {
          return false;
        }
        return true;
      },
    });
    this.libroCommand.registerLibroCommand(command, AINativeCommands['CellChat'], {
      execute: async () => {
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
