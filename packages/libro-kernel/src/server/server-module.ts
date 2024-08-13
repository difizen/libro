import { ManaModule } from '@difizen/mana-app';

import { LibroKernelSpecModule } from '../index.js';

import { ServerConnection } from './server-connection.js';
import { ServerManager } from './server-manager.js';

export const LibroServerModule = ManaModule.create()
  .register(ServerConnection, ServerManager)
  .dependOn(LibroKernelSpecModule);
