import type { Contribution } from '@difizen/mana-app';
import { contrib, Priority } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';

import { EditorWidgetContribution } from './widget-protocol.js';

@singleton()
export class EditorWidgetManager {
  protected readonly completionsProvider: Contribution.Provider<EditorWidgetContribution>;

  constructor(
    @contrib(EditorWidgetContribution)
    editorWidgetContribution: Contribution.Provider<EditorWidgetContribution>,
  ) {
    this.completionsProvider = editorWidgetContribution;
  }

  findWidgetProvider() {
    const prioritized = Priority.sortSync(
      this.completionsProvider.getContributions(),
      (contribution) => contribution.canHandle(),
    );
    const sorted = prioritized.map((c) => c.value);
    return sorted[0];
  }
}
