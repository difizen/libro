/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CommandRegistry, KeybindingRegistry } from '@difizen/mana-app';
import {
  LibroCommandRegister,
  LibroExtensionSlotContribution,
} from '@difizen/libro-core';
import type {
  LibroExtensionSlotFactory,
  LibroSlot,
  LibroView,
} from '@difizen/libro-core';
import {
  ViewManager,
  CommandContribution,
  KeybindingContribution,
  inject,
  singleton,
} from '@difizen/mana-app';

import { LibroSearchView } from './libro-search-view.js';

export const LibroSearchToggleCommand = {
  ShowLibroSearch: {
    id: 'libro-search:toggle',
    keybind: 'ctrlcmd+F',
  },
  // LibroSearchToggle: {
  //   id: 'libro-search:toogle',
  //   keybind: 'ctrlcmd+F',
  // },
};

@singleton({
  contrib: [
    CommandContribution,
    KeybindingContribution,
    LibroExtensionSlotContribution,
  ],
})
export class LibroSearchManager
  implements
    CommandContribution,
    KeybindingContribution,
    LibroExtensionSlotContribution
{
  @inject(ViewManager) viewManager: ViewManager;
  @inject(LibroCommandRegister) libroCommandRegister: LibroCommandRegister;
  protected viewMap: Map<string, LibroSearchView> = new Map();

  public readonly slot: LibroSlot = 'container';
  registerKeybindings(keybindings: KeybindingRegistry): void {
    this.libroCommandRegister.registerKeybinds(
      keybindings,
      LibroSearchToggleCommand,
      false,
      false,
    );
  }
  registerCommands(commands: CommandRegistry) {
    this.libroCommandRegister.registerLibroCommand(
      commands,
      LibroSearchToggleCommand.ShowLibroSearch,
      {
        execute: (cell, libro, position) => {
          if (libro) {
            this.showSearchView(libro);
          }
        },
      },
    );
  }
  factory: LibroExtensionSlotFactory = async (libro: LibroView) => {
    const view = await this.viewManager.getOrCreateView(LibroSearchView, {
      parentId: libro.id,
    });
    view.libro = libro;
    this.viewMap.set(libro.id, view);
    view.onDisposed(() => {
      this.viewMap.delete(libro.id);
    });
    return view;
  };

  showSearchView = (libro: LibroView) => {
    this.viewMap.get(libro.id)?.show();
  };
}
