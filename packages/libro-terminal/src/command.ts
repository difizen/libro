import type { Command, CommandRegistry, KeybindingRegistry } from '@difizen/mana-app';
import { ConfigurationService, KeybindingContribution } from '@difizen/mana-app';
import { SlotViewManager } from '@difizen/mana-app';
import { inject, ViewManager } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';
import { CommandContribution } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';

import { terminalDefaultSlot } from './configuration.js';
import { TerminalManager } from './manager.js';
import { LibroTerminalView } from './view.js';

export const TerminalCommands: Record<string, Command & { keybind?: string }> = {
  OpenTerminal: {
    id: 'libro-terminal-open',
    label: l10n.t('新建终端'),
    keybind: 'ctrl+`',
  },
  CloseTerminal: {
    id: 'libro-terminal-close',
    label: l10n.t('关闭终端'),
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
      execute: async (name?: string) => {
        try {
          const terminalView =
            await this.viewManager.getOrCreateView<LibroTerminalView>(
              LibroTerminalView,
              this.manager.getTerminalArgs(name),
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
    commands.registerCommand(TerminalCommands['CloseTerminal'], {
      execute: async (name: string) => {
        try {
          const terminalView =
            await this.viewManager.getOrCreateView<LibroTerminalView>(
              LibroTerminalView,
              this.manager.getTerminalArgs(name),
            );

          terminalView.dispose();
        } catch (e) {
          console.error(e);
        }
      },
    });
  }
}
