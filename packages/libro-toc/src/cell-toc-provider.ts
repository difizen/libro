import type { CellView } from '@difizen/libro-core';
import type { Contribution } from '@difizen/mana-app';
import { Priority } from '@difizen/mana-app';
import { contrib, singleton } from '@difizen/mana-app';

import { CellTOCProviderContribution } from './toc-protocol.js';

@singleton()
export class LibroCellTOCProvider {
  @contrib(CellTOCProviderContribution)
  protected providerContribution: Contribution.Provider<CellTOCProviderContribution>;

  createCellTOCProvider(cell: CellView) {
    const ctrb = this.findCellTOCProviderContribution(cell);
    if (ctrb) {
      return ctrb.factory(cell);
    }
    return;
  }

  protected findCellTOCProviderContribution(
    cell: CellView,
  ): CellTOCProviderContribution | undefined {
    const prioritized = Priority.sortSync(
      this.providerContribution.getContributions(),
      (contribution) => contribution.canHandle(cell),
    );
    const sorted = prioritized.map((c) => c.value);
    return sorted[0];
  }
}
