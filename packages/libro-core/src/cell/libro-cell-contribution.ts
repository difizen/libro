import { inject, singleton } from '@difizen/mana-app';

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
  libroCellModelFactory: CellModelFactory;

  constructor(@inject(CellModelFactory) libroCellModelFactory: CellModelFactory) {
    this.libroCellModelFactory = libroCellModelFactory;
  }

  cellMeta: CellMeta = {
    type: 'raw',
    name: 'Raw',
    order: 'a',
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canHandle(_options: CellOptions): number {
    return 1;
  }
  createModel(options: CellOptions): CellModel {
    const model = this.libroCellModelFactory(options);
    return model;
  }
  view = LibroCellView;
}
