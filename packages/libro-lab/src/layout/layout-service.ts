import type { View, ViewOpenHandlerOptions, SlotView } from '@difizen/mana-app';
import {
  DefaultSlotView,
  inject,
  prop,
  singleton,
  SlotViewManager,
} from '@difizen/mana-app';

import type { LibroLabLayoutSlotsType, StatusType } from './protocol.js';
import { LibroLabLayoutSlots } from './protocol.js';

export type VisibilityMap = Record<LibroLabLayoutSlotsType, boolean>;

@singleton()
export class LayoutService {
  @inject(SlotViewManager) protected readonly slotViewManager: SlotViewManager;

  @prop()
  serverSatus: StatusType = 'loading';
  @prop()
  visibilityMap: VisibilityMap = {
    [LibroLabLayoutSlots.header]: true,
    [LibroLabLayoutSlots.container]: true,
    [LibroLabLayoutSlots.main]: true,
    [LibroLabLayoutSlots.footer]: true,
    [LibroLabLayoutSlots.navigator]: false,
    [LibroLabLayoutSlots.content]: true,
    [LibroLabLayoutSlots.contentBottom]: false,
    [LibroLabLayoutSlots.alert]: true,
  };

  isAreaVisible(slot: LibroLabLayoutSlotsType): boolean {
    return this.visibilityMap[slot];
  }

  setAreaVisible(slot: LibroLabLayoutSlotsType, visible: boolean) {
    this.visibilityMap[slot] = visible;
  }

  async addView(view: View, option?: ViewOpenHandlerOptions): Promise<void> {
    const { slot = LibroLabLayoutSlots.main, ...viewOpenOption } = option || {};
    await this.slotViewManager.addView(view, slot, viewOpenOption);
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
        return slotView.onActiveChange(handler);
      }
    }
    return undefined;
  }
}
