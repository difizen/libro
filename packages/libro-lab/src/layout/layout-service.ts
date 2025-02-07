import type { Disposable } from '@difizen/libro-common/mana-common';
import { LibroNavigatableView, LibroService } from '@difizen/libro-jupyter';
import type {
  View,
  ViewOpenHandlerOptions,
  ViewOpenOption,
} from '@difizen/libro-common/mana-app';
import { SideTabView } from '@difizen/libro-common/mana-app';
import { observable } from '@difizen/libro-common/mana-app';
import {
  DefaultSlotView,
  inject,
  prop,
  singleton,
  SlotViewManager,
} from '@difizen/libro-common/mana-app';

import type { LibroLabLayoutSlotsType, StatusType } from './protocol.js';
import { LibroLabLayoutSlots } from './protocol.js';

export type VisibilityMap = Record<LibroLabLayoutSlotsType, boolean>;
@singleton()
export class LayoutService {
  protected readonly slotViewManager: SlotViewManager;
  protected readonly libroService: LibroService;

  constructor(
    @inject(SlotViewManager) slotViewManager: SlotViewManager,
    @inject(LibroService) libroService: LibroService,
  ) {
    this.slotViewManager = slotViewManager;
    this.libroService = libroService;
    this.onOpenSlotActiveChange();
    this.slotViewManager.onViewAdded((args) => {
      this.onViewAdded(args.slot, args.view, args.option);
    });
  }

  @prop()
  serverSatus: StatusType = 'loading';

  @prop()
  refreshKey: string;

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

  refresh() {
    this.refreshKey = new Date().getTime().toString();
  }

  isAreaVisible(slot: LibroLabLayoutSlotsType): boolean {
    return this.visibilityMap[slot];
  }

  setAreaVisible(slot: LibroLabLayoutSlotsType, visible: boolean) {
    this.visibilityMap[slot] = visible;
  }

  protected onViewAdded(
    slot: string,
    view: View | undefined,
    option: ViewOpenOption | undefined,
  ) {
    if (!view) {
      // TODO: hide slot
      return;
    }
    if (Object.keys(this.visibilityMap).includes(slot)) {
      if (option?.reveal) {
        this.setAreaVisible(slot as LibroLabLayoutSlotsType, true);
      }
    }
  }

  async addView(view: View, option?: ViewOpenHandlerOptions): Promise<void> {
    const { slot = LibroLabLayoutSlots.main, ...viewOpenOption } = option || {};
    if (option?.reveal) {
      this.setAreaVisible(slot, true);
    }
    await this.slotViewManager.addView(view, slot, viewOpenOption);
  }

  getAllSlotView(slot: LibroLabLayoutSlotsType) {
    return this.slotViewManager.getSlotView(slot);
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

  onSlotActiveChange(
    slot: LibroLabLayoutSlotsType,
    handler: () => void,
  ): Disposable | undefined {
    if (this.isAreaVisible(slot)) {
      const slotView = this.slotViewManager.getSlotView(slot);
      if (slotView instanceof DefaultSlotView) {
        return slotView.onActiveChange(handler);
      }
    }
    return undefined;
  }

  shouldRenderNavigatorContent(): boolean {
    if (!this.visibilityMap[LibroLabLayoutSlots.navigator]) {
      return false;
    }
    const slotView = this.slotViewManager.getSlotView(LibroLabLayoutSlots.navigator);
    if (slotView instanceof SideTabView) {
      return !!slotView.showTabContent;
    }
    return false;
  }

  async onOpenSlotActiveChange() {
    if (this.isAreaVisible(LibroLabLayoutSlots.content)) {
      const slotView = await this.slotViewManager.getOrCreateSlotView(
        LibroLabLayoutSlots.content,
      );
      observable(slotView);
      if (slotView instanceof DefaultSlotView) {
        slotView.onActiveChange(async () => {
          const active = slotView.active;
          if (active instanceof LibroNavigatableView) {
            await active.ready;
            active.libroView?.focus();
            this.libroService.active = active.libroView;
          } else {
            this.libroService.active = undefined;
          }
        });
      }
    }
  }
}
