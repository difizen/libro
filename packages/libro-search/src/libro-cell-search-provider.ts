import type { CellView } from '@difizen/libro-core';
import type { Contribution } from '@difizen/mana-app';
import { Priority } from '@difizen/mana-app';
import { contrib, transient } from '@difizen/mana-app';

import { CellSearchProviderContribution } from './libro-search-protocol.js';

@transient()
export class LibroCellSearchProvider {
  @contrib(CellSearchProviderContribution)
  protected providerContribution: Contribution.Provider<CellSearchProviderContribution>;

  createCellSearchProvider(cell: CellView) {
    const ctrb = this.findCellSearchProviderContribution(cell);
    if (ctrb) {
      return ctrb.factory(cell);
    }
    return;
  }

  getInitialQuery = (cell: CellView): string => {
    const ctrb = this.findCellSearchProviderContribution(cell);
    if (ctrb && ctrb.getInitialQuery) {
      return ctrb.getInitialQuery(cell);
    }
    return '';
  };

  protected findCellSearchProviderContribution(
    cell: CellView,
  ): CellSearchProviderContribution | undefined {
    const prioritized = Priority.sortSync(
      this.providerContribution.getContributions(),
      (contribution) => contribution.canHandle(cell),
    );
    const sorted = prioritized.map((c) => c.value);
    return sorted[0];
  }
}
