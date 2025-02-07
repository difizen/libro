import { inject, singleton } from '@difizen/libro-common/app';

import type { CellModel, CellOptions } from '../libro-protocol.js';

import type { CellMeta } from './libro-cell-protocol.js';
import {
  CellModelContribution,
  CellModelFactory,
  CellViewContribution,
} from './libro-cell-protocol.js';
import { LibroCellView } from './libro-cell-view.js';

@singleton({ contrib: [CellModelContribution, CellViewContribution] })
export class LibroCellContribution
  implements CellModelContribution, CellViewContribution
{
  @inject(CellModelFactory) libroCellModelFactory: CellModelFactory;

  cellMeta: CellMeta = {
    type: 'raw',
    name: 'Raw',
    order: 'a',
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canHandle(options: CellOptions): number {
    return 1;
  }
  createModel(options: CellOptions): CellModel {
    const model = this.libroCellModelFactory(options);
    return model;
  }
  view = LibroCellView;
}
