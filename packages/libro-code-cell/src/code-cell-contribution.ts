import { CellModelContribution, CellViewContribution } from '@difizen/libro-core';
import type { CellMeta, CellModel, CellOptions } from '@difizen/libro-core';
import { inject, singleton } from '@difizen/mana-app';

import { CodeCellModelFactory } from './code-cell-protocol.js';
import { LibroCodeCellView } from './code-cell-view.js';

@singleton({ contrib: [CellModelContribution, CellViewContribution] })
export class CodeEditorCellContribution
  implements CellModelContribution, CellViewContribution
{
  @inject(CodeCellModelFactory) libroCellModelFactory: CodeCellModelFactory;

  cellMeta: CellMeta = {
    type: 'code',
    name: 'Python',
    order: 'b',
  };

  canHandle(options: CellOptions): number {
    return options?.cell?.cell_type === this.cellMeta.type ? 1000 : 1;
  }

  async createModel(options: CellOptions): Promise<CellModel> {
    const model = this.libroCellModelFactory(options);
    // await model.outputAreaReady;
    // model.outputArea.setupCellModel(model);
    return model;
  }

  view = LibroCodeCellView;
}
