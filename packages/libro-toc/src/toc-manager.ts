import type { LibroView } from '@difizen/libro-core';
import { inject, singleton } from '@difizen/mana-app';

import type { LibroTOCProvider } from './toc-provider.js';
import { LibroTOCProviderFactory } from './toc-provider.js';

@singleton()
export class LibroTOCManager {
  protected tocProviderMap = new Map<LibroView, LibroTOCProvider>();
  protected libroTOCProviderFactory: LibroTOCProviderFactory;

  constructor(
    @inject(LibroTOCProviderFactory) libroTOCProviderFactory: LibroTOCProviderFactory,
  ) {
    this.libroTOCProviderFactory = libroTOCProviderFactory;
  }

  getTOCProvider(view: LibroView): LibroTOCProvider {
    let provider = this.tocProviderMap.get(view);
    if (provider) {
      return provider;
    }
    provider = this.libroTOCProviderFactory({ view });
    this.tocProviderMap.set(view, provider);
    view.onDisposed(() => {
      this.tocProviderMap.delete(view);
    });
    return provider;
  }
}
