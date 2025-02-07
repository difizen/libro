import { MarkdownModule } from '@difizen/libro-markdown';
import { ManaModule } from '@difizen/libro-common/mana-app';

import { standardRendererFactories as initialFactories } from './rendermime-factory.js';
import {
  IRenderMimeRegistryOptions,
  RenderMimeContribution,
} from './rendermime-protocol.js';
import { RenderMimeRegistry } from './rendermime-registry.js';

export const LibroRenderMimeModule = ManaModule.create()
  .contribution(RenderMimeContribution)
  .register(RenderMimeRegistry, {
    token: IRenderMimeRegistryOptions,
    useValue: {
      initialFactories,
    },
  })
  .dependOn(MarkdownModule);
