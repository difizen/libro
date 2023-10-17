import type { Contribution } from '@difizen/mana-app';
import { contrib, Priority, singleton } from '@difizen/mana-app';

import { ContentContribution } from './libro-content-protocol.js';

@singleton()
export class LibroContentService {
  protected contentProvider: Contribution.Provider<ContentContribution>;
  constructor(
    @contrib(ContentContribution)
    contentProvider: Contribution.Provider<ContentContribution>,
  ) {
    this.contentProvider = contentProvider;
  }
  protected findProvider(
    options: Record<string, any>,
    model: any,
  ): ContentContribution {
    const prioritized = Priority.sortSync(
      this.contentProvider.getContributions(),
      (contribution) => contribution.canHandle(options, model),
    );
    const sorted = prioritized.map((c) => c.value);
    return sorted[0]!;
  }

  loadLibroContent(options: Record<string, any>, model: any) {
    return this.findProvider(options, model).loadContent(options, model);
  }
}
