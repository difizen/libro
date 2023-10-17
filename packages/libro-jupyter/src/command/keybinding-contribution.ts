import {
  NotebookCommands,
  DocumentCommands,
  LibroCommandRegister,
} from '@difizen/libro-core';
import {
  inject,
  KeybindingRegistry,
  singleton,
  KeybindingContribution,
} from '@difizen/mana-app';

@singleton({ contrib: KeybindingContribution })
export class LibroJupyterKeybindingContribution implements KeybindingContribution {
  @inject(LibroCommandRegister) protected readonly libroCommand: LibroCommandRegister;
  constructor(@inject(KeybindingRegistry) keybindRegistry: KeybindingRegistry) {
    // 快捷键命中时默认阻止事件冒泡
    keybindRegistry.preventDefault = true;
    keybindRegistry.stopPropagation = true;
  }
  registerKeybindings(keybindings: KeybindingRegistry) {
    this.libroCommand.registerKeybinds(keybindings, NotebookCommands);
    this.libroCommand.registerKeybinds(keybindings, DocumentCommands);
  }
}
