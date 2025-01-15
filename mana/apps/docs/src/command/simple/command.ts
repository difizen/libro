import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import type { CommandRegistry } from '@difizen/mana-app';
import { prop } from '@difizen/mana-app';
import { ManaModule, singleton, CommandContribution } from '@difizen/mana-app';

export const CommonCommand = {
  INCREASE_COUNT: {
    id: 'common.command.increase',
    icon: PlusOutlined,
    label: 'INCREASE',
  },
  DECREACE_COUNT: {
    id: 'common.command.decreace',
    icon: MinusOutlined,
    label: 'DECREACE',
  },
};

@singleton({ contrib: CommandContribution })
export class MyCommand implements CommandContribution {
  @prop() count = 0;

  registerCommands(command: CommandRegistry): void {
    command.registerCommand(CommonCommand.INCREASE_COUNT, {
      execute: () => {
        this.count += 1;
      },
      isVisible: (data: any) => data instanceof MyCommand,
      isEnabled: (data: any) => data instanceof MyCommand && data.count < 10,
    });
    command.registerCommandWithContext(CommonCommand.DECREACE_COUNT, this, {
      execute: () => {
        this.count -= 1;
      },
      isVisible: (ctx) => ctx.count > -1,
      isEnabled: (ctx) => ctx.count > 0,
    });
  }
}

export const CommonCommandModule = ManaModule.create().register(MyCommand);
