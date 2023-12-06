import type { Contribution } from '@difizen/mana-app';
import { contrib, Priority, singleton } from '@difizen/mana-app';

import {
  ContentContribution,
  ContentSaveContribution,
} from './libro-content-protocol.js';

@singleton()
export class LibroContentService {
  @contrib(ContentContribution)
  contentProvider: Contribution.Provider<ContentContribution>;

  @contrib(ContentSaveContribution)
  contentSaveProvider: Contribution.Provider<ContentSaveContribution>;

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

  protected findSaveProvider(
    options: Record<string, any>,
    model: any,
  ): ContentSaveContribution {
    const prioritized = Priority.sortSync(
      this.contentSaveProvider.getContributions(),
      (contribution) => contribution.canHandle(options, model),
    );
    const sorted = prioritized.map((c) => c.value);
    return sorted[0]!;
  }

  saveLibroContent(options: Record<string, any>, model: any) {
    return this.findSaveProvider(options, model).saveContent(options, model);
  }
}
