import { ManaModule } from '@difizen/mana-app';

import { LibroCommandContribution } from './libro-command-contribution.js';
import { LibroCommandRegister } from './libro-command-register.js';

export const LibroCommandModule = ManaModule.create().register(
  LibroCommandContribution,
  LibroCommandRegister,
);
