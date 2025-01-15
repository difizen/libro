import type { CellMeta, CellModel, CellOptions } from '@difizen/libro-jupyter';
import { CellModelContribution, CellViewContribution } from '@difizen/libro-jupyter';
import { inject, singleton } from '@difizen/mana-app';
import { LibroEditorDemoCellView } from './libro-editor-demo-cell-view';
import { LibroEditorDemoCellModelFactory } from './libro-editor-demo-cell-protocol';

@singleton({
  contrib: [CellModelContribution, CellViewContribution],
})
export class LibroEditorDemoCellContribution
  implements CellModelContribution, CellViewContribution
{
  @inject(LibroEditorDemoCellModelFactory)
  libroEditorDemoCellModelFactory: LibroEditorDemoCellModelFactory;

  cellMeta: CellMeta = {
    type: 'editor-demo',
    name: 'Editor Demo',
    order: 'f',
    nbformatType: 'code',
  };

  canHandle(options: CellOptions, libroType?: string): number {
    return libroType === this.cellMeta.type ? 2000 : -1;
  }

  async createModel(options: CellOptions): Promise<CellModel> {
    const model = this.libroEditorDemoCellModelFactory(options);
    return model;
  }

  view = LibroEditorDemoCellView;
}
