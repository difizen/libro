import type { Command } from '../../../mana-core/index.js';
import { CommandContribution, CommandRegistry } from '../../../mana-core/index.js';
import { l10n } from '../../../mana-l10n/index.js'; /* eslint-disable max-len, @typescript-eslint/indent */
import { inject, singleton } from '../../../mana-syringe/index.js';

export const CLOSE_TAB: Command = {
  id: 'tab.close',
  label: l10n.t('关闭'),
};

@singleton({ contrib: [CommandContribution] })
export class CommonCommand implements CommandContribution {
  protected readonly commandRegistry: CommandRegistry;
  constructor(@inject(CommandRegistry) commandRegistry: CommandRegistry) {
    this.commandRegistry = commandRegistry;
  }
  registerCommands(command: CommandRegistry): void {
    command.registerCommand(CLOSE_TAB, {
      execute: () => {
        //
      },
    });
  }
}
