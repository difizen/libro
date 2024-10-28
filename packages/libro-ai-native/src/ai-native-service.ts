import type { CellView } from '@difizen/libro-jupyter';
import { getOrigin, inject, prop, singleton, ViewManager } from '@difizen/mana-app';

import { LibroAINativeForCellView } from './ai-native-for-cell-view.js';
import type { LibroChatView } from './chat-view.js';

@singleton()
export class LibroAINativeService {
  @prop()
  showSideToolbar = false;

  chatViewMap: Map<string, LibroChatView> = new Map();

  showChatMap: Map<string, boolean> = new Map();
  @inject(ViewManager)
  viewManager: ViewManager;

  libroAINativeForCellViewMap: Map<string, LibroAINativeForCellView> = new Map();

  async getOrCreateLibroAINativeForCellView(id: string, cell: CellView) {
    let libroAINativeForCellView = this.libroAINativeForCellViewMap.get(id);
    if (libroAINativeForCellView) {
      return libroAINativeForCellView;
    } else {
      libroAINativeForCellView = await this.viewManager.getOrCreateView(
        LibroAINativeForCellView,
        { id: id, cell: getOrigin(cell) },
      );
      this.libroAINativeForCellViewMap.set(cell.id, libroAINativeForCellView);
    }
    return libroAINativeForCellView;
  }
}
