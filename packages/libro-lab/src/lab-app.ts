import {
  LibroService,
  ServerConnection,
  LibroJupyterConfiguration,
} from '@difizen/libro-jupyter';
import type { FileTreeView } from '@difizen/mana-app';
import {
  ConfigurationService,
  FileTreeViewFactory,
  URI,
  ApplicationContribution,
  SlotViewManager,
  ViewManager,
  inject,
  singleton,
} from '@difizen/mana-app';

import { LibroLabSlots } from './layout/index.js';

@singleton({ contrib: ApplicationContribution })
export class LibroLabApp implements ApplicationContribution {
  @inject(ServerConnection) serverConnection: ServerConnection;
  @inject(LibroService) libroService: LibroService;
  @inject(SlotViewManager) slotViewManager: SlotViewManager;
  @inject(ViewManager) viewManager: ViewManager;
  @inject(ConfigurationService) configurationService: ConfigurationService;

  async onStart() {
    this.serverConnection.updateSettings({
      baseUrl: 'http://localhost:8888/',
      wsUrl: 'ws://localhost:8888/',
    });
    this.configurationService.set(
      LibroJupyterConfiguration['OpenSlot'],
      LibroLabSlots.main,
    );
    await this.initialWorkspace();
  }

  protected async initialWorkspace() {
    const view =
      await this.viewManager.getOrCreateView<FileTreeView>(FileTreeViewFactory);
    if (view) {
      view.model.rootVisible = false;
      view.model.location = new URI('/');
    }
  }
}
