import { ViewManager } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';

import type { LibroView } from '../libro-view.js';
import { LibroExtensionSlotContribution } from '../slot/index.js';
import type { LibroExtensionSlotFactory, LibroSlot } from '../slot/index.js';

import { LibroAddCellView } from './libro-add-cell-view.js';

@singleton({ contrib: LibroExtensionSlotContribution })
export class LibroAddCellSlotContribution implements LibroExtensionSlotContribution {
  protected viewManager: ViewManager;
  constructor(@inject(ViewManager) viewManager: ViewManager) {
    this.viewManager = viewManager;
  }
  protected viewMap: Map<string, LibroAddCellView> = new Map();

  public readonly slot: LibroSlot = 'list';

  factory: LibroExtensionSlotFactory = async (libro: LibroView) => {
    const view = await this.viewManager.getOrCreateView(LibroAddCellView, {
      parentId: libro.id,
    });
    view.parent = libro;
    this.viewMap.set(libro.id, view);
    view.onDisposed(() => {
      this.viewMap.delete(libro.id);
    });
    return view;
  };
}
