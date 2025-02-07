import type { LanguageSpecRegistry } from '@difizen/libro-code-editor';
import { LanguageSpecContribution } from '@difizen/libro-code-editor';
import type { CellModel } from '@difizen/libro-core';
import type { CellMeta, CellOptions } from '@difizen/libro-core';
import { CellViewContribution, CellModelContribution } from '@difizen/libro-core';
import { inject } from '@difizen/libro-common/mana-app';
import { singleton } from '@difizen/libro-common/mana-app';

import { LibroPromptCellModelFactory } from './prompt-cell-protocol.js';
import { LibroPromptCellView } from './prompt-cell-view.js';

@singleton({
  contrib: [CellModelContribution, CellViewContribution, LanguageSpecContribution],
})
export class PromptCellContribution
  implements CellModelContribution, CellViewContribution, LanguageSpecContribution
{
  @inject(LibroPromptCellModelFactory)
  libroCellModelFactory: LibroPromptCellModelFactory;

  cellMeta: CellMeta = {
    type: 'prompt',
    name: 'Propmt',
    order: 'f',
    nbformatType: 'code',
  };

  canHandle(options: CellOptions, libroType?: string): number {
    return libroType === this.cellMeta.type ? 2000 : -1;
  }

  async createModel(options: CellOptions): Promise<CellModel> {
    const model = this.libroCellModelFactory(options);
    return model;
  }

  view = LibroPromptCellView;

  registerLanguageSpec = (register: LanguageSpecRegistry) => {
    register.registerLanguageSpec({
      name: 'Prompt',
      language: 'prompt',
      mime: 'application/vnd.libro.prompt+json',
      ext: [],
    });
  };
}
