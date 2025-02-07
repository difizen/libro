import { ManaModule } from '@difizen/libro-common/app';

import { LibroToolbarContribution } from './libro-toolbar.js';
import { RestartClearOutputsContribution } from './restart-clear-outputs-contribution.js';
import { ShutdownContribution } from './shutdown-contribution.js';

export const LibroToolbarModule = ManaModule.create().register(
  LibroToolbarContribution,
  RestartClearOutputsContribution,
  ShutdownContribution,
);
