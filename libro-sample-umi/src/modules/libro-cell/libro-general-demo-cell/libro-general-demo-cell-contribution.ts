import type { CellMeta, CellModel, CellOptions } from '@difizen/libro-jupyter';
import { CellModelContribution, CellViewContribution } from '@difizen/libro-jupyter';
import { inject } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';
import { LibroGeneralDemoCellModelFactory } from './libro-general-demo-cell-protocol';
import { LibroGeneralDemoCellView } from './libro-general-demo-cell-view.js';

@singleton({
  contrib: [CellModelContribution, CellViewContribution],
})
export class LibroGeneralDemoCellContribution
  implements CellModelContribution, CellViewContribution
{
  @inject(LibroGeneralDemoCellModelFactory)
  libroGeneralDemoCellModelFactory: LibroGeneralDemoCellModelFactory;

  cellMeta: CellMeta = {
    type: 'general-demo',
    name: 'General Demo',
    order: 'e',
    nbformatType: 'code',
  };

  canHandle(options: CellOptions, libroType?: string): number {
    return libroType === this.cellMeta.type ? 2000 : -1;
  }

  async createModel(options: CellOptions): Promise<CellModel> {
    const model = this.libroGeneralDemoCellModelFactory(options);
    return model;
  }

  view = LibroGeneralDemoCellView;
}
