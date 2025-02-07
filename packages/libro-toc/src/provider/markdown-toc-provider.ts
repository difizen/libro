import { LibroMarkdownCellModel } from '@difizen/libro-core';
import type { CellView } from '@difizen/libro-core';
import { MarkdownParser } from '@difizen/libro-markdown';
import { inject, singleton, watch } from '@difizen/libro-common/mana-app';

import type { CellTOCProvider } from '../toc-protocol.js';
import { HeadingType, CellTOCProviderContribution } from '../toc-protocol.js';

import { getHTMLHeadings } from './html.js';

@singleton({ contrib: [CellTOCProviderContribution] })
export class MarkDownCellTOCProvider implements CellTOCProviderContribution {
  protected readonly markdownParser: MarkdownParser;
  constructor(@inject(MarkdownParser) markdownParser: MarkdownParser) {
    this.markdownParser = markdownParser;
  }

  canHandle(cell: CellView) {
    return LibroMarkdownCellModel.is(cell.model) ? 100 : 0;
  }
  factory(cell: CellView): CellTOCProvider {
    return {
      getHeadings: () => {
        return getHTMLHeadings(
          this.markdownParser.render(cell.model.value, { cellId: cell.model.id }),
          HeadingType.Markdown,
        );
      },
      updateWatcher: (update) => {
        return watch(cell.model, 'value', update);
      },
    };
  }
}
