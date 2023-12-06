import {
  LibroService,
  ServerConnection,
  LibroJupyterConfiguration,
  ServerManager,
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

import { LibroLabLayoutSlots } from './layout/index.js';
import { LayoutService } from './layout/layout-service.js';

const ShouldPreventStoreViewKey = 'mana-should-prevent-store-view';

@singleton({ contrib: ApplicationContribution })
export class LibroLabApp implements ApplicationContribution {
  @inject(ServerConnection) serverConnection: ServerConnection;
  @inject(LibroService) libroService: LibroService;
  @inject(SlotViewManager) slotViewManager: SlotViewManager;
  @inject(ViewManager) viewManager: ViewManager;
  @inject(ConfigurationService) configurationService: ConfigurationService;
  @inject(ServerManager) serverManager: ServerManager;
  @inject(LayoutService) layoutService: LayoutService;

  async onStart() {
    localStorage.setItem(ShouldPreventStoreViewKey, 'false');
    this.configurationService.set(
      LibroJupyterConfiguration['OpenSlot'],
      LibroLabLayoutSlots.content,
    );
    this.serverManager.ready
      .then(() => {
        this.layoutService.setAreaVisible(LibroLabLayoutSlots.navigator, true);
        this.layoutService.setAreaVisible(LibroLabLayoutSlots.alert, false);
        this.layoutService.serverSatus = 'success';
        this.initialWorkspace();
        return;
      })
      .catch(() => {
        //
      });
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
