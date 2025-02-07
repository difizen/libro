import { ManaModule } from '@difizen/libro-common/mana-app';

import { BaseManager } from './basemanager.js';
import { LibroContentsModule } from './contents/contents-module.js';
import { LibroKernelModule } from './kernel/kernel-module.js';
import { LibroKernelSpecModule } from './kernelspec/index.js';
import { LibroKernelConnectionManager } from './libro-kernel-connection-manager.js';
import { LibroServerModule } from './server/index.js';
import { LibroSessionModule } from './session/session-module.js';

export const LibroKernelManageModule = ManaModule.create()
  .dependOn(
    LibroSessionModule,
    LibroKernelModule,
    LibroServerModule,
    LibroKernelSpecModule,
    LibroContentsModule,
  )
  .register(BaseManager, LibroKernelConnectionManager);
