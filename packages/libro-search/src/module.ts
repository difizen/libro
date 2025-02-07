import { ManaModule } from '@difizen/libro-common/mana-app';

import './index.less';
import { LibroCellSearchProvider } from './libro-cell-search-provider.js';
import {
  GenericSearchProvider,
  GenericSearchProviderFactory,
} from './libro-search-generic-provider.js';
import { LibroSearchManager } from './libro-search-manager.js';
import { LibroSearchModel } from './libro-search-model.js';
import {
  CellSearchProviderContribution,
  SearchProviderOption,
} from './libro-search-protocol.js';
import {
  LibroSearchProvider,
  LibroSearchProviderFactory,
} from './libro-search-provider.js';
import { LibroSearchUtils } from './libro-search-utils.js';
import { LibroSearchView } from './libro-search-view.js';

export const LibroSearchModule = ManaModule.create()
  .register(
    LibroSearchUtils,
    LibroSearchManager,
    LibroSearchView,
    GenericSearchProvider,
    LibroSearchModel,
    LibroSearchProvider,
    LibroCellSearchProvider,
    LibroSearchUtils,
    {
      token: GenericSearchProviderFactory,
      useFactory: (ctx) => {
        return (option) => {
          const child = ctx.container.createChild();
          child.register({
            token: SearchProviderOption,
            useValue: option,
          });
          return child.get(GenericSearchProvider);
        };
      },
    },
    {
      token: LibroSearchProviderFactory,
      useFactory: (ctx) => {
        return (option) => {
          const child = ctx.container.createChild();
          child.register({
            token: SearchProviderOption,
            useValue: option,
          });
          return child.get(LibroSearchProvider);
        };
      },
    },
  )
  .contribution(CellSearchProviderContribution);
