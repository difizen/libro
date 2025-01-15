import type { CommandRegistry, KeybindingRegistry } from '@difizen/mana-app';
import { prop } from '@difizen/mana-app';
import {
  ManaModule,
  singleton,
  CommandContribution,
  KeybindingContribution,
} from '@difizen/mana-app';
import { message } from 'antd';

export const CommonCommand = {
  INCREASE_COUNT: {
    id: 'common.command.increase',
    label: 'INCREASE',
  },
  DECREACE_COUNT: {
    id: 'common.command.decreace',
    label: 'DECREACE',
  },
  DOUBLE_COUNT: {
    id: 'common.command.double',
    label: 'INCREASE',
  },
};

@singleton({ contrib: [CommandContribution, KeybindingContribution] })
export class MyCommand implements CommandContribution, KeybindingContribution {
  @prop() count = 0;

  registerKeybindings(keybindings: KeybindingRegistry): void {
    keybindings.registerKeybinding({
      command: CommonCommand.INCREASE_COUNT.id,
      keybinding: 'shift+up',
      when: 'shiftMode',
    });
    keybindings.registerKeybinding({
      command: CommonCommand.DECREACE_COUNT.id,
      keybinding: 'shift+down',
      when: 'shiftMode',
    });
    keybindings.registerKeybinding({
      command: CommonCommand.INCREASE_COUNT.id,
      keybinding: 'ctrlcmd+shift+up',
      when: 'ctrlcmdMode',
    });
    keybindings.registerKeybinding({
      command: CommonCommand.DECREACE_COUNT.id,
      keybinding: 'ctrlcmd+shift+down',
      when: 'ctrlcmdMode',
    });
    keybindings.registerKeybinding({
      command: CommonCommand.DOUBLE_COUNT.id,
      keybinding: 'd d',
    });
    keybindings.onMatchChange((match) => {
      if (match?.binding.keybinding) {
        message.info(
          `[mana] keybinding match change: ${match?.binding.keybinding}, when: ${match?.binding.when}`,
        );
      }
    });
  }

  registerCommands(command: CommandRegistry): void {
    command.registerCommand(CommonCommand.INCREASE_COUNT, {
      execute: () => {
        this.count += 1;
      },
    });
    command.registerCommand(CommonCommand.DECREACE_COUNT, {
      execute: () => {
        this.count -= 1;
      },
    });
    command.registerCommand(CommonCommand.DOUBLE_COUNT, {
      execute: () => {
        this.count = this.count * 2;
      },
    });
  }
}

export const CommonCommandModule = ManaModule.create().register(MyCommand);
