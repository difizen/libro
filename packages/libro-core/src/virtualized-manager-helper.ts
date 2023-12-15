import { inject, prop, singleton } from '@difizen/mana-app';

import type { NotebookModel } from './libro-protocol.js';
import { VirtualizedManagerOptionFactory } from './libro-protocol.js';
import type { VirtualizedManager } from './virtualized-manager.js';

@singleton()
export class VirtualizedManagerHelper {
  @inject(VirtualizedManagerOptionFactory) factory: VirtualizedManagerOptionFactory;

  @prop()
  current?: VirtualizedManager;
  protected virtualizedManagerHelperMap = new Map<string, VirtualizedManager>();

  setCurrent(libroModel: NotebookModel) {
    const virtualizedManagerHelper = this.getOrCreate(libroModel);
    this.current = virtualizedManagerHelper;
  }

  getOrCreate(libroModel: NotebookModel): VirtualizedManager {
    const exist = this.virtualizedManagerHelperMap.get(libroModel.id);
    if (exist) {
      return exist;
    }
    const virtualizedManagerHelper = this.factory({ libroModel: libroModel });
    this.virtualizedManagerHelperMap.set(libroModel.id, virtualizedManagerHelper);
    return virtualizedManagerHelper;
  }
}
