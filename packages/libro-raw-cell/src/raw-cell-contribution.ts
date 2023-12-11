import type { CellMeta, CellModel, CellOptions } from '@difizen/libro-core';
import { CellModelContribution, CellViewContribution } from '@difizen/libro-core';
import { inject, singleton } from '@difizen/mana-app';

import { RawCellModelFactory } from './raw-cell-protocol.js';
import { LibroRawCellView } from './raw-cell-view.js';

@singleton({ contrib: [CellModelContribution, CellViewContribution] })
export class RawCellContribution
  implements CellModelContribution, CellViewContribution
{
  @inject(RawCellModelFactory) libroCellModelFactory: RawCellModelFactory;

  cellMeta: CellMeta = {
    type: 'raw',
    name: 'Raw',
    order: 'e',
  };

  canHandle(options: CellOptions): number {
    return options?.cell?.cell_type === this.cellMeta.type ? 100 : 1;
  }

  async createModel(options: CellOptions): Promise<CellModel> {
    const model = this.libroCellModelFactory(options);
    return model;
  }

  view = LibroRawCellView;
}
