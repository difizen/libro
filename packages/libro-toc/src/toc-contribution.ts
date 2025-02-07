import type {
  LibroView,
  LibroExtensionSlotFactory,
  LibroSlot,
} from '@difizen/libro-core';
import { LibroExtensionSlotContribution } from '@difizen/libro-core';
import { ViewManager } from '@difizen/libro-common/app';
import { inject, singleton } from '@difizen/libro-common/app';

import { TOCView } from './toc-view.js';

@singleton({ contrib: [LibroExtensionSlotContribution] })
export class LibroTocSlotContribution implements LibroExtensionSlotContribution {
  @inject(ViewManager) viewManager: ViewManager;
  protected viewMap: Map<string, TOCView> = new Map();

  public readonly slot: LibroSlot = 'right';

  factory: LibroExtensionSlotFactory = async (libro: LibroView) => {
    const view = await this.viewManager.getOrCreateView(TOCView, {
      parentId: libro.id,
    });
    view.parent = libro;
    this.viewMap.set(libro.id, view);
    view.onDisposed(() => {
      this.viewMap.delete(libro.id);
    });
    return view;
  };
  // viewOpenOption = {
  // reveal: true,
  // order: 'a',
  // };
}
