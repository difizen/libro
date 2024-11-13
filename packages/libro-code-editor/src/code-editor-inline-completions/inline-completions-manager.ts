import type { Contribution } from '@difizen/mana-app';
import {
  contrib,
  Priority,
  singleton,
  ApplicationContribution,
} from '@difizen/mana-app';

import type {
  InlineCompletionImplement,
  InlineCompletionRegistry,
} from './inline-completions-protocol.js';
import { InlineCompletionContribution } from './inline-completions-protocol.js';

@singleton({ contrib: [ApplicationContribution] })
export class InlineCompletionManager
  implements InlineCompletionRegistry, ApplicationContribution
{
  private completionImplements: InlineCompletionImplement[] = [];
  protected readonly completionsProvider: Contribution.Provider<InlineCompletionContribution>;

  constructor(
    @contrib(InlineCompletionContribution)
    completionsProvider: Contribution.Provider<InlineCompletionContribution>,
  ) {
    this.completionsProvider = completionsProvider;
  }

  addCompletion(obj: InlineCompletionImplement) {
    this.completionImplements.push(obj);
  }

  get getCompletionImplements() {
    return this.completionImplements;
  }

  onStart() {
    const prioritized = Priority.sortSync(
      this.completionsProvider.getContributions(),
      (contribution) => contribution.canHandle(),
    );
    prioritized.map((c) => c.value.registerCompletion(this));
  }
}
