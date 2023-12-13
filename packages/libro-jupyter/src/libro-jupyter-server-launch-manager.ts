import { ServerManager, ServerConnection } from '@difizen/libro-kernel';
import { inject, singleton } from '@difizen/mana-app';
import { ApplicationContribution } from '@difizen/mana-app';

@singleton({ contrib: [ApplicationContribution] })
export class JupyterServerLaunchManager implements ApplicationContribution {
  protected serverManager: ServerManager;
  protected serverConnection: ServerConnection;

  constructor(
    @inject(ServerManager)
    serverManager: ServerManager,
    @inject(ServerConnection)
    serverConnection: ServerConnection,
  ) {
    this.serverManager = serverManager;
    this.serverConnection = serverConnection;
  }

  async onStart() {
    this.serverConnection.updateSettings({});
  }
}
