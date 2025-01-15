import type { Newable } from '@difizen/mana-common';
import { Priority } from '@difizen/mana-common';

import type { Contribution } from '../contribution/index';
import { Syringe } from '../core';
import { singleton } from '../decorator';
import { registerSideOption } from '../side-option';

export interface PrioritizedContribution<O = any, T = any> {
  canHandle: (option: O) => number;
  handle: (option: O) => T;
}

@singleton()
export class PrioritizedContributionManager<
  O = any,
  T extends PrioritizedContribution<O> = PrioritizedContribution,
> {
  protected findContribution(option: O, provider: Contribution.Provider<T>): T {
    const prioritized = Priority.sortSync(provider.getContributions(), (contribution) =>
      contribution.canHandle(option),
    );
    const sorted = prioritized.map((c) => c.value);
    return sorted[0];
  }
}

export const prioritizedContributionFactory = <O = any, T = any>() => {
  return (
    token: Syringe.Token<PrioritizedContribution<O, T>>,
    contribution: PrioritizedContribution<O, T>,
  ) => {
    return (target: Newable<T>): void => {
      registerSideOption(
        {
          token: token,
          useValue: contribution,
          lifecycle: Syringe.Lifecycle.singleton,
        },
        target,
      );
    };
  };
};
