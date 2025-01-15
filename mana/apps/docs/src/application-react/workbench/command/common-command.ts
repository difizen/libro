/* eslint-disable max-len, @typescript-eslint/indent */
import type { Command } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';
import { CommandContribution, CommandRegistry } from '@difizen/mana-app';

export namespace CommonCommands {
  export const ABOUT_COMMAND: Command = {
    id: 'core.about',
    label: 'About',
  };
}

@singleton({ contrib: [CommandContribution] })
export class CommonCommand implements CommandContribution {
  protected readonly commandRegistry: CommandRegistry;

  constructor(@inject(CommandRegistry) commandRegistry: CommandRegistry) {
    this.commandRegistry = commandRegistry;
  }
  registerCommands(command: CommandRegistry): void {
    command.registerCommand(CommonCommands.ABOUT_COMMAND, {
      execute: () => {
        // console.log('execute about command');
      },
    });
  }
}
