import type { LanguageSpecRegistry } from '@difizen/libro-code-editor';
import { LanguageSpecContribution } from '@difizen/libro-code-editor';
import { CellModelContribution, CellViewContribution } from '@difizen/libro-core';
import type { CellMeta, CellModel, CellOptions } from '@difizen/libro-core';
import { inject, singleton } from '@difizen/libro-common/mana-app';

import { CodeCellModelFactory } from './code-cell-protocol.js';
import { LibroCodeCellView } from './code-cell-view.js';

@singleton({
  contrib: [CellModelContribution, CellViewContribution, LanguageSpecContribution],
})
export class CodeEditorCellContribution
  implements CellModelContribution, CellViewContribution, LanguageSpecContribution
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

  registerLanguageSpec = (register: LanguageSpecRegistry) => {
    register.registerLanguageSpec({
      name: 'Python',
      language: 'python',
      ext: ['.py'],
      mime: 'text/x-python',
    });
  };
}
