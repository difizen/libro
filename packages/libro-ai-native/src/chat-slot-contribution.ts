import type {
  LibroView,
  LibroExtensionSlotFactory,
  LibroSlot,
} from '@difizen/libro-jupyter';
import { LibroExtensionSlotContribution } from '@difizen/libro-jupyter';
import { ViewManager } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';

import { ChatView } from './chat-view.js';

@singleton({ contrib: [LibroExtensionSlotContribution] })
export class LibroAIChatSlotContribution implements LibroExtensionSlotContribution {
  @inject(ViewManager) viewManager: ViewManager;
  viewMap: Map<string, ChatView> = new Map();

  public readonly slot: LibroSlot = 'right';

  factory: LibroExtensionSlotFactory = async (libro: LibroView) => {
    const view = await this.viewManager.getOrCreateView(ChatView, {
      parentId: libro.id,
    });
    view.parent = libro;
    this.viewMap.set(libro.id, view);
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
