import type { Command, CommandRegistry, KeybindingRegistry } from '@difizen/mana-app';
import { ConfigurationService, KeybindingContribution } from '@difizen/mana-app';
import { SlotViewManager } from '@difizen/mana-app';
import { inject, ViewManager } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';
import { CommandContribution } from '@difizen/mana-app';

import { terminalDefaultSlot } from './configuration.js';
import { TerminalManager } from './manager.js';
import { LibroTerminalView } from './view.js';

export const TerminalCommands: Record<string, Command & { keybind?: string }> = {
  OpenTerminal: {
    id: 'libro-terminal-open',
    label: '新建终端',
    keybind: 'ctrl+`',
  },
};

@singleton({ contrib: [CommandContribution, KeybindingContribution] })
export class TerminalCommandContribution
  implements CommandContribution, KeybindingContribution
{
  @inject(ViewManager) viewManager: ViewManager;
  @inject(SlotViewManager) protected slotManager: SlotViewManager;
  @inject(ConfigurationService) protected config: ConfigurationService;
  @inject(TerminalManager) manager: TerminalManager;
  registerKeybindings(keybindings: KeybindingRegistry): void {
    if (TerminalCommands['OpenTerminal'].keybind) {
      keybindings.registerKeybinding({
        keybinding: TerminalCommands['OpenTerminal'].keybind,
        command: TerminalCommands['OpenTerminal'].id,
      });
    }
  }

  registerCommands(commands: CommandRegistry): void {
    commands.registerCommand(TerminalCommands['OpenTerminal'], {
      execute: async () => {
        try {
          const terminalView =
            await this.viewManager.getOrCreateView<LibroTerminalView>(
              LibroTerminalView,
              {
                id: this.manager.newTerminalName(),
              },
            );
          const slot = await this.config.get(terminalDefaultSlot);
          if (slot) {
            this.slotManager.addView(terminalView, slot, {
              reveal: true,
            });
          }
        } catch (e) {
          console.error(e);
        }
      },
    });
  }
}
