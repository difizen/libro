import type { SlotView, View, ViewOpenHandlerOptions } from '@difizen/mana-app';
import {
  DefaultSlotView,
  inject,
  Notifier,
  prop,
  singleton,
  SlotViewManager,
} from '@difizen/mana-app';

import type { LibroLabLayoutSlotsType } from './protocol.js';
import { LibroLabLayoutSlots } from './protocol.js';

export type VisibilityMap = Record<LibroLabLayoutSlotsType, boolean>;

@singleton()
export class LayoutService {
  @inject(SlotViewManager) protected readonly slotViewManager: SlotViewManager;

  @prop()
  protected visibilityMap: VisibilityMap = {
    [LibroLabLayoutSlots.header]: true,
    [LibroLabLayoutSlots.container]: true,
    [LibroLabLayoutSlots.main]: true,
    [LibroLabLayoutSlots.footer]: true,
    [LibroLabLayoutSlots.navigator]: true,
    [LibroLabLayoutSlots.content]: true,
    [LibroLabLayoutSlots.contentBottom]: false,
  };

  isAreaVisible(slot: LibroLabLayoutSlotsType): boolean {
    return this.visibilityMap[slot];
  }

  setAreaVisible(slot: LibroLabLayoutSlotsType, visible: boolean) {
    this.visibilityMap[slot] = visible;
  }

  async addView(view: View, option?: ViewOpenHandlerOptions): Promise<void> {
    const { slot = LibroLabLayoutSlots.main, ...viewOpenOption } = option || {};
    const slotView = this.slotViewManager.getSlotView(slot) as SlotView;
    await slotView.addView(view, viewOpenOption);
  }

  getActiveView(slot: LibroLabLayoutSlotsType) {
    if (this.isAreaVisible(slot)) {
      const slotView = this.slotViewManager.getSlotView(slot);
      if (slotView instanceof DefaultSlotView) {
        return slotView.active;
      }
    }
    return undefined;
  }

  onSlotActiveChange(slot: LibroLabLayoutSlotsType, handler: () => void) {
    if (this.isAreaVisible(slot)) {
      const slotView = this.slotViewManager.getSlotView(slot);
      if (slotView instanceof DefaultSlotView) {
        return Notifier.find(slotView, 'active')?.onChange(() => handler());
      }
    }
    return undefined;
  }
}
