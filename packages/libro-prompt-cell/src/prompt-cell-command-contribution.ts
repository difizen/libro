import type { CellView, NotebookView } from '@difizen/libro-core';
import { LibroCommandRegister, LibroCellView, LibroView } from '@difizen/libro-core';
import type { CommandRegistry } from '@difizen/mana-app';
import {
  CommandContribution,
  inject,
  KeybindingContribution,
  KeybindingRegistry,
  singleton,
} from '@difizen/mana-app';

export const LibroPromptCellCommands = {
  ChangeCellToPrompt: {
    id: 'notebook:change-cell-to-prompt',
    label: `Change to Prompt`,
    keybind: 'p',
    when: 'commandMode',
  },
};

@singleton({ contrib: [CommandContribution, KeybindingContribution] })
export class LibroPromptCellCommandContribution
  implements CommandContribution, KeybindingContribution
{
  @inject(LibroCommandRegister)
  protected readonly libroCommand: LibroCommandRegister;
  constructor(@inject(KeybindingRegistry) keybindRegistry: KeybindingRegistry) {
    // 快捷键命中时默认阻止事件冒泡
    keybindRegistry.preventDefault = true;
    keybindRegistry.stopPropagation = true;
  }

  registerCommands(command: CommandRegistry): void {
    this.libroCommand.registerLibroCommand(
      command,
      LibroPromptCellCommands.ChangeCellToPrompt,
      {
        execute: (cell: CellView | undefined, libro: NotebookView | undefined) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.invertCell(cell, 'prompt');
        },
        isEnabled: (cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || !libro.model.cellsEditable) {
            return false;
          }
          return true;
        },
      },
    );
  }
  registerKeybindings(keybindings: KeybindingRegistry) {
    this.libroCommand.registerKeybinds(keybindings, LibroPromptCellCommands);
  }
}
