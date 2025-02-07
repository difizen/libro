import { ManaModule } from '@difizen/libro-common/app';

import { ServerConnection } from './server-connection.js';
import { ServerManager } from './server-manager.js';

export const LibroServerModule = ManaModule.create().register(
  ServerConnection,
  ServerManager,
);
