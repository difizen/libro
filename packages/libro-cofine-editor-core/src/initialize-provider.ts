import type { Contribution } from '@difizen/libro-common/mana-app';
import {
  contrib,
  DefaultContributionProvider,
  singleton,
  Syringe,
} from '@difizen/libro-common/mana-app';
import type monaco from '@difizen/monaco-editor-core';

export const InitializeContribution = Syringe.defineToken('InitializeContribution');
export interface InitializeContribution {
  initialized?: boolean;
  onInitialize?: (coreMonaco: typeof monaco) => void | Promise<void>;
  awaysInitialized?: boolean;
}
@singleton()
export class InitializeProvider {
  provider: Contribution.Provider<InitializeContribution>;
  constructor(
    @contrib(InitializeContribution)
    provider: Contribution.Provider<InitializeContribution>,
  ) {
    this.provider = provider;
  }

  async initialize(coreMonaco: typeof monaco): Promise<void> {
    const contributions = this.provider.getContributions({ cache: false });
    for (const contribution of contributions) {
      if (contribution.onInitialize) {
        try {
          if (!contribution.initialized) {
            const inited = contribution.onInitialize(coreMonaco);
            if (inited) {
              // eslint-disable-next-line no-await-in-loop
              await inited;
            }
            if (!contribution.awaysInitialized) {
              contribution.initialized = true;
            }
          }
        } catch (error) {
          // noop
        }
      }
    }
  }
}

export class InitializeContributionProvider extends DefaultContributionProvider<InitializeContribution> {
  override getContributions() {
    this.services = undefined;
    return super.getContributions();
  }
}
