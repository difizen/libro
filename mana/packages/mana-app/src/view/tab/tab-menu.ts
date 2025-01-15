import type { Command } from '@difizen/mana-core';
import { CommandContribution, CommandRegistry } from '@difizen/mana-core';
import { l10n } from '@difizen/mana-l10n'; /* eslint-disable max-len, @typescript-eslint/indent */
import { inject, singleton } from '@difizen/mana-syringe';

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
