import type { Event } from '@difizen/mana-common';

import { Syringe } from '../core';

export type Option = {
  /**
   * collected from the parent containers
   */
  recursive?: boolean;
  /**
   * use cache
   */
  cache?: boolean;
};
export type Provider<T extends Record<string, any>> = {
  getContributions: (option?: Option) => T[];
  onChanged: Event<void>;
};
export const Provider = Syringe.defineToken('SyringeContributionProvider', {
  global: true,
});

class ContributionOptionConfigImpl {
  recursive = false;
  cache = true;
}

export const ContributionOptionConfig = new ContributionOptionConfigImpl();
