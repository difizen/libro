import type { Contribution } from '@difizen/mana-app';
import { contrib, singleton, Syringe } from '@difizen/mana-app';

export const LazyLoaderRegistryContribution = Syringe.defineToken(
  'LazyLoaderRegistryContribution',
);
export interface LazyLoaderRegistryContribution extends Disposable {
  handleLazyLoder: () => void;
  isLazyLoader?: boolean;
}

@singleton()
export class LazyLoaderRegistry {
  provider: Contribution.Provider<LazyLoaderRegistryContribution>;
  constructor(
    @contrib(LazyLoaderRegistryContribution)
    provider: Contribution.Provider<LazyLoaderRegistryContribution>,
  ) {
    this.provider = provider;
  }
  handleLazyLoder() {
    this.provider.getContributions({ cache: false }).forEach((c) => {
      if (c.isLazyLoader) {
        return;
      }
      c.handleLazyLoder();
    });
  }
}
