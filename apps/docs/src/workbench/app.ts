import {
  LibroService,
  ServerConnection,
  LibroJupyterConfiguration,
} from '@difizen/libro-jupyter';
import type { FileTreeView } from '@difizen/mana-app';
import { ConfigurationService } from '@difizen/mana-app';
import { FileTreeViewFactory } from '@difizen/mana-app';
import { URI } from '@difizen/mana-app';
import {
  ApplicationContribution,
  SlotViewManager,
  ViewManager,
} from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';

import { LibroWorkbenchSlots } from './layout/workbench-layout.view.js';

@singleton({ contrib: ApplicationContribution })
export class LibroApp implements ApplicationContribution {
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
      LibroWorkbenchSlots.Main,
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
