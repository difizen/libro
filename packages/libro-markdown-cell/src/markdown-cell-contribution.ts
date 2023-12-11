import type { CellMeta, CellOptions, CellModel } from '@difizen/libro-core';
import { CellModelContribution, CellViewContribution } from '@difizen/libro-core';
import { singleton, inject } from '@difizen/mana-app';

import { MarkdownCellModelFactory } from './markdown-cell-protocol.js';
import { MarkdownCellView } from './markdown-cell-view.js';

@singleton({ contrib: [CellModelContribution, CellViewContribution] })
export class MarkdownCellContribution
  implements CellModelContribution, CellViewContribution
{
  @inject(MarkdownCellModelFactory) markdownCellModelFactory: MarkdownCellModelFactory;

  cellMeta: CellMeta = {
    type: 'markdown',
    name: 'Markdown',
    order: 'c',
  };

  canHandle(options: CellOptions): number {
    if (options?.cell?.cell_type === this.cellMeta.type) {
      return 999;
    }
    return -1;
  }

  createModel(options: CellOptions): CellModel {
    const model = this.markdownCellModelFactory(options);
    return model;
  }

  view = MarkdownCellView;
}
