import { LibroCommandRegister } from '@difizen/libro-jupyter';
import type { CommandRegistry } from '@difizen/mana-app';
import { CommandContribution, inject, singleton } from '@difizen/mana-app';

import { LibroDemoCommand } from './libro-demo-command';

@singleton({ contrib: CommandContribution })
export class LibroDemoCommandContribution implements CommandContribution {
  @inject(LibroCommandRegister) protected readonly libroCommand: LibroCommandRegister;

  registerCommands(command: CommandRegistry): void {
    this.libroCommand.registerLibroCommand(command, LibroDemoCommand['demoCommand1'], {
      execute: async (cell, libro, path) => {
        console.warn(
          '使用 LibroCommandRegister 的方式注册的 demoCommand1 被执行',
          cell,
          libro,
          path,
        );
      },
      isEnabled: () => {
        return true;
      },
    });
    command.registerCommand(LibroDemoCommand['demoCommand2'], {
      execute: async (args1, args2) => {
        console.warn(
          '使用 CommandRegistry 的方式注册的 demoCommand2 被执行',
          args1,
          args2,
        );
      },
    });
  }
}
