import { ServerConnection, ServerManager } from '@difizen/libro';
import { ConfigurationService } from '@difizen/libro-common/mana-app';
import { SlotViewManager } from '@difizen/libro-common/mana-app';
import { ApplicationContribution, ViewManager } from '@difizen/libro-common/mana-app';
import { inject, singleton } from '@difizen/libro-common/mana-app';

@singleton({ contrib: ApplicationContribution })
export class LibroApp implements ApplicationContribution {
  @inject(ServerConnection) serverConnection: ServerConnection;
  @inject(ServerManager) serverManager: ServerManager;
  @inject(ViewManager) viewManager: ViewManager;
  @inject(SlotViewManager) slotViewManager: SlotViewManager;
  @inject(ConfigurationService) configurationService: ConfigurationService;

  async onStart() {
    this.serverConnection.updateSettings({
      baseUrl: 'http://localhost:8000/',
      wsUrl: 'ws://localhost:8888/',
    });
    this.serverManager.launch();
  }
}
