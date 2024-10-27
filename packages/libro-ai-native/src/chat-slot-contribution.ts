import type {
  LibroView,
  LibroExtensionSlotFactory,
  LibroSlot,
} from '@difizen/libro-jupyter';
import { LibroExtensionSlotContribution } from '@difizen/libro-jupyter';
import { ViewManager } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';

import { LibroChatView } from './chat-view.js';

@singleton({ contrib: [LibroExtensionSlotContribution] })
export class LibroAIChatSlotContribution implements LibroExtensionSlotContribution {
  @inject(ViewManager) viewManager: ViewManager;
  viewMap: Map<string, LibroChatView> = new Map();
  showChatMap: Map<string, boolean> = new Map();

  public readonly slot: LibroSlot = 'right';

  factory: LibroExtensionSlotFactory = async (libro: LibroView) => {
    const view = await this.viewManager.getOrCreateView(LibroChatView, {
      parentId: libro.id,
    });
    view.parent = libro;
    view.chatView.libro = libro;
    this.viewMap.set(libro.id, view);
    this.showChatMap.set(libro.id, false);
    view.onDisposed(() => {
      this.viewMap.delete(libro.id);
    });
    return view;
  };
  viewOpenOption = {
    reveal: false,
    order: 'a',
  };
}
