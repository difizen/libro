import { ApplicationContribution, ViewManager, ViewStorage } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';
import { URI } from '@difizen/mana-app';

import { FileView } from './file-view/index.js';

@singleton({ contrib: ApplicationContribution })
export class FileApplication implements ApplicationContribution {
  protected readonly viewManager: ViewManager;
  readonly viewStorage: ViewStorage;

  constructor(
    @inject(ViewManager) viewManager: ViewManager,
    @inject(ViewStorage) viewStorage: ViewStorage,
  ) {
    this.viewManager = viewManager;
    this.viewStorage = viewStorage;
  }

  async onViewStart() {
    const view = await this.viewManager.getOrCreateView<FileView>(FileView);
    if (!this.viewStorage.canStoreView) {
      view.model.rootVisible = false;
      view.model.location = new URI('file:///');
    }
  }
}
