import { ManaModule } from '@difizen/libro-common/mana-app';

import { DefaultContentContribution } from './libro-content-contribution.js';
import {
  ContentContribution,
  ContentSaveContribution,
} from './libro-content-protocol.js';
import { LibroContentService } from './libro-content-service.js';
import { DefaultSaveContentContribution } from './libro-save-content-contribution.js';

export const LibroContentModule = ManaModule.create()
  .contribution(ContentContribution, ContentSaveContribution)
  .register(
    DefaultContentContribution,
    LibroContentService,
    DefaultSaveContentContribution,
  );
