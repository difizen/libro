import { LibroService } from '@difizen/libro';
import { RootSlotId } from '@difizen/libro-common/mana-app';
import {
  ApplicationContribution,
  SlotViewManager,
} from '@difizen/libro-common/mana-app';
import { inject, singleton } from '@difizen/libro-common/mana-app';

@singleton({ contrib: ApplicationContribution })
export class LibroApp implements ApplicationContribution {
  @inject(LibroService) libroService: LibroService;
  @inject(SlotViewManager) slotViewManager: SlotViewManager;

  async onStart() {
    const view = await this.libroService.getOrCreateView({});
    this.slotViewManager.addView(view, RootSlotId);
  }
}
