import type { LanguageSpecRegistry } from '@difizen/libro-code-editor';
import { LanguageSpecContribution } from '@difizen/libro-code-editor';
import type { CellMeta, CellOptions, CellModel } from '@difizen/libro-core';
import { CellModelContribution, CellViewContribution } from '@difizen/libro-core';
import { singleton, inject } from '@difizen/mana-app';

import { MarkdownCellModelFactory } from './markdown-cell-protocol.js';
import { MarkdownCellView } from './markdown-cell-view.js';

@singleton({
  contrib: [CellModelContribution, CellViewContribution, LanguageSpecContribution],
})
export class MarkdownCellContribution
  implements CellModelContribution, CellViewContribution, LanguageSpecContribution
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

  registerLanguageSpec = (register: LanguageSpecRegistry) => {
    register.registerLanguageSpec({
      name: 'Markdown',
      language: 'markdown',
      mime: 'text/x-markdown',
      ext: ['.md', '.markdown', '.mkd', '.sh'],
    });
  };
}
