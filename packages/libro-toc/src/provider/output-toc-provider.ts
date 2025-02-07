import type { MultilineString } from '@difizen/libro-common';
import { concatMultilineString } from '@difizen/libro-common';
import type { CellView } from '@difizen/libro-core';
import { ExecutableCellView } from '@difizen/libro-core';
import { RenderMimeRegistry } from '@difizen/libro-rendermime';
import { inject, singleton } from '@difizen/libro-common/mana-app';
import { watch } from '@difizen/libro-common/mana-app';

import type { CellTOCProvider } from '../toc-protocol.js';
import { CellTOCProviderContribution } from '../toc-protocol.js';

import { getHTMLHeadings } from './html.js';
import { isMarkdown, MarkdownMimeType } from './markdown.js';

@singleton({ contrib: [CellTOCProviderContribution] })
export class OutputTOCProvider implements CellTOCProviderContribution {
  @inject(RenderMimeRegistry) renderMimeRegistry: RenderMimeRegistry;
  canHandle(cell: CellView) {
    return ExecutableCellView.is(cell) ? 100 : 0;
  }

  factory(cell: CellView): CellTOCProvider {
    if (!ExecutableCellView.is(cell)) {
      throw new Error('expected EditorCellView');
    }

    return {
      getHeadings: () => {
        return cell.outputArea.outputs
          .filter((item) => {
            const defaultRenderMimeType =
              this.renderMimeRegistry.preferredMimeType(item);
            if (!defaultRenderMimeType) {
              return false;
            }
            return isMarkdown(defaultRenderMimeType);
          })
          .map((item) => {
            const html = this.renderMimeRegistry.markdownParser?.render(
              concatMultilineString(item.data[MarkdownMimeType] as MultilineString),
              { cellId: cell.model.id },
            );
            const head = getHTMLHeadings(html ?? '');
            return head;
          })
          .flat();
      },
      updateWatcher: (update) => {
        return watch(cell.outputArea, 'outputs', update);
      },
    };
  }
}
