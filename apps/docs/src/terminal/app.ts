import {
  ServerConnection,
  ServerManager,
  AppExtention,
  AppIOC,
} from '@difizen/libro-lab';

const { ApplicationContribution, ViewManager, SlotViewManager, ConfigurationService } =
  AppExtention;
const { inject, singleton } = AppIOC;

@singleton({ contrib: ApplicationContribution })
export class LibroApp implements AppExtention.ApplicationContribution {
  @inject(ServerConnection) serverConnection: ServerConnection;
  @inject(ServerManager) serverManager: ServerManager;
  @inject(ViewManager) viewManager: AppExtention.ViewManager;
  @inject(SlotViewManager) slotViewManager: AppExtention.SlotViewManager;
  @inject(ConfigurationService)
  configurationService: AppExtention.ConfigurationService;

  async onStart() {
    this.serverConnection.updateSettings({
      baseUrl: 'http://localhost:8000/',
      wsUrl: 'ws://localhost:8888/',
    });
    this.serverManager.launch();
  }
}
