import type { Contribution } from '@difizen/mana-app';
import { SlotViewManager } from '@difizen/mana-app';
import { contrib, inject, singleton } from '@difizen/mana-app';

import type { LibroView } from '../libro-view.js';

import type { LibroSlot } from './libro-slot-protocol.js';
import { LibroExtensionSlotContribution } from './libro-slot-protocol.js';

@singleton()
export class LibroSlotManager {
  @inject(SlotViewManager) slotViewManager: SlotViewManager;
  protected readonly libroExtraProvider: Contribution.Provider<LibroExtensionSlotContribution>;
  constructor(
    @contrib(LibroExtensionSlotContribution)
    libroExtraProvider: Contribution.Provider<LibroExtensionSlotContribution>,
  ) {
    this.libroExtraProvider = libroExtraProvider;
  }

  getSlotName(libro: LibroView, slot: LibroSlot): string {
    return `libro-slot-${slot}-${libro.id}`;
  }

  setup(libro: LibroView) {
    this.libroExtraProvider.getContributions().forEach(async (item) => {
      const extra = await item.factory(libro);
      this.slotViewManager.addView(
        extra,
        this.getSlotName(libro, item.slot),
        item.viewOpenOption,
      );
    });
  }
}
