import { ManaModule } from '@difizen/mana-app';

import { DefaultContentContribution } from './libro-content-contribution.js';
import { ContentContribution } from './libro-content-protocol.js';
import { LibroContentService } from './libro-content-service.js';

export const LibroContentModule = ManaModule.create()
  .contribution(ContentContribution)
  .register(DefaultContentContribution, LibroContentService);
