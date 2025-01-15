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
    label: '',
  },
};

@singleton({ contrib: [CommandContribution, KeybindingContribution] })
export class MyCommand implements CommandContribution, KeybindingContribution {
  @prop() count = 0;
  registerKeybindings(keybindings: KeybindingRegistry): void {
    keybindings.registerKeybinding({
      command: CommonCommand.INCREASE_COUNT.id,
      keybinding: 'shift+ctrlcmd+m',
    });
    keybindings.registerKeybinding({
      command: CommonCommand.DECREACE_COUNT.id,
      keybinding: 'shift+ctrlcmd+-',
    });
    keybindings.registerKeybinding({
      command: CommonCommand.DOUBLE_COUNT.id,
      keybinding: 'ctrlcmd+s',
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
        // console.log(this);
        this.count = this.count * 2;
      },
    });
  }
}

export const CommonCommandModule = ManaModule.create().register(MyCommand);
