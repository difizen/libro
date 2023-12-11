import { LibroServerModule } from '@difizen/libro-kernel';
import { ManaModule } from '@difizen/mana-app';

import { DocumentConnectionManager } from './connection-manager.js';
import { CodeExtractorsManager } from './extractors/index.js';
import { FeatureManager } from './feature.js';
import { LSPAppContribution } from './lsp-app-contribution.js';
import { LanguageServerManager } from './manager.js';
import {
  ILanguageServerManagerFactory,
  ILanguageServerManagerOptions,
} from './tokens.js';

export const LibroLSPModule = ManaModule.create()
  .register(
    LSPAppContribution,
    DocumentConnectionManager,
    FeatureManager,
    CodeExtractorsManager,
    LanguageServerManager,
    {
      token: ILanguageServerManagerFactory,
      useFactory: (ctx) => {
        return (option: ILanguageServerManagerOptions) => {
          const child = ctx.container.createChild();
          child.register({ token: ILanguageServerManagerOptions, useValue: option });
          return child.get(LanguageServerManager);
        };
      },
    },
  )
  .dependOn(LibroServerModule);
