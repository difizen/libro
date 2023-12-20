import type { View } from '@difizen/mana-app';
import { transient, view, CardTabView, inject } from '@difizen/mana-app';

import { LayoutService } from './layout-service.js';
import { LibroLabLayoutSlots } from './protocol.js';

@transient()
@view('libro-lab-layout-content-bottom')
export class ContentBottomTabView extends CardTabView {
  @inject(LayoutService) layoutService: LayoutService;

  override close(item: View) {
    item.dispose();
    if (this.children.length === 0) {
      this.layoutService.setAreaVisible(LibroLabLayoutSlots.contentBottom, false);
    }
  }
}
