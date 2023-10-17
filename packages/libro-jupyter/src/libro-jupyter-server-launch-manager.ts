import { ServerManager, ServerConnection } from '@difizen/libro-kernel';
import { inject, singleton } from '@difizen/mana-app';
import { ApplicationContribution } from '@difizen/mana-app';

import { ServerLaunchManager } from './libro-jupyter-protocol.js';

@singleton({ contrib: [ServerLaunchManager, ApplicationContribution] })
export class JupyterServerLaunchManager
  implements ServerLaunchManager, ApplicationContribution
{
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
    const host = location.host;
    this.serverConnection.updateSettings({
      baseUrl: `http://${host}`,
      wsUrl: `ws://${host}`,
    });
    this.launch();
  }

  launch() {
    return this.serverManager.launch();
  }
}
