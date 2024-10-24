import {
  LibroCommandRegister,
  LibroToolbarArea,
  LibroView,
} from '@difizen/libro-jupyter';
import type { CommandRegistry, ToolbarRegistry } from '@difizen/mana-app';
import { inject } from '@difizen/mana-app';
import { CommandContribution } from '@difizen/mana-app';
import { singleton, ToolbarContribution } from '@difizen/mana-app';

import { AINativeCommands } from './ai-native-command.js';
import { AIToolbarSelector } from './ai-side-toolbar-selector.js';

@singleton({ contrib: [CommandContribution, ToolbarContribution] })
export class LibroAINativeCommandContribution
  implements ToolbarContribution, CommandContribution
{
  @inject(LibroCommandRegister) protected readonly libroCommand: LibroCommandRegister;
  registerToolbarItems(registry: ToolbarRegistry): void {
    registry.registerItem({
      id: AINativeCommands['AISideToolbarSelect'].id,
      command: AINativeCommands['AISideToolbarSelect'].id,
      icon: AIToolbarSelector,
      showLabelInline: true,
      group: ['group2'],
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
