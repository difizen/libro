import { ServerManager, ServerConnection } from '@difizen/libro-kernel';
import { inject, singleton } from '@difizen/mana-app';

import { ServerLaunchManager } from './libro-jupyter-protocol.js';

@singleton({ contrib: [ServerLaunchManager] })
export class JupyterServerLaunchManager implements ServerLaunchManager {
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

  launch() {
    return this.serverManager.launch();
  }
}
