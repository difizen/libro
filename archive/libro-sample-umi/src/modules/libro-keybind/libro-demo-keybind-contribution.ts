import { LibroCommandRegister } from '@difizen/libro-jupyter';
import type { KeybindingRegistry, CommandRegistry } from '@difizen/mana-app';
import {
  inject,
  singleton,
  KeybindingContribution,
  CommandContribution,
} from '@difizen/mana-app';

import { LibroDemoKeybindCommand } from './libro-demo-keybind-command';

@singleton({ contrib: [KeybindingContribution, CommandContribution] })
export class LibroDemoKeybindingContribution
  implements KeybindingContribution, CommandContribution
{
  @inject(LibroCommandRegister) protected readonly libroCommand: LibroCommandRegister;

  registerKeybindings(keybindings: KeybindingRegistry) {
    this.libroCommand.registerKeybinds(keybindings, LibroDemoKeybindCommand);
  }

  registerCommands(command: CommandRegistry): void {
    this.libroCommand.registerLibroCommand(
      command,
      LibroDemoKeybindCommand['demokeybindCommand1'],
      {
        execute: async () => {
          console.warn('快捷键demo示例1被触发执行');
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      LibroDemoKeybindCommand['demokeybindCommand2'],
      {
        execute: async () => {
          console.warn('快捷键demo示例2被触发执行');
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      LibroDemoKeybindCommand['demokeybindCommand3'],
      {
        execute: async () => {
          console.warn('快捷键demo示例3被触发执行');
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      LibroDemoKeybindCommand['demokeybindCommand4'],
      {
        execute: async () => {
          console.warn('快捷键demo示例4被触发执行');
        },
      },
    );
  }
}
