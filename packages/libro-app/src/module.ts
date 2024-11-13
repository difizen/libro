import { ManaModule } from '@difizen/mana-app';

import { AppFileCommandContribution } from './app-file-command-contribution.js';

export const LibroAppModule = ManaModule.create()
  .register(AppFileCommandContribution)
  .dependOn();
