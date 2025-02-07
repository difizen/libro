import { ManaModule } from '@difizen/libro-common/mana-app';

import { KernelSpecManager } from './manager.js';
import { KernelSpecRestAPI } from './restapi.js';

export const LibroKernelSpecModule = ManaModule.create().register(
  KernelSpecManager,
  KernelSpecRestAPI,
);
