import { LibroCodeCellView } from '@difizen/libro-code-cell';
import type { CellView } from '@difizen/libro-core';
import { CellSearchProviderContribution } from '@difizen/libro-search';
import { ViewManager } from '@difizen/libro-common/app';
import { inject, singleton } from '@difizen/libro-common/app';

import { CodeCellSearchProviderFactory } from './code-cell-search-protocol.js';

@singleton({ contrib: CellSearchProviderContribution })
export class CodeCellSearchProviderContribution
  implements CellSearchProviderContribution
{
  @inject(ViewManager) viewManager: ViewManager;
  @inject(CodeCellSearchProviderFactory)
  providerfactory: CodeCellSearchProviderFactory;
  canHandle = (cell: CellView) => {
    if (cell instanceof LibroCodeCellView) {
      return 100;
    }
    return 0;
  };
  factory(cell: CellView) {
    return this.providerfactory({ cell: cell as LibroCodeCellView });
  }
  /**
   * Get an initial query value if applicable so that it can be entered
   * into the search box as an initial query
   *
   * @returns Initial value used to populate the search box.
   */
  getInitialQuery = (cell: CellView): string => {
    if (cell instanceof LibroCodeCellView) {
      const selection = cell.editor?.getSelectionValue();
      // if there are newlines, just return empty string
      return selection?.search(/\r?\n|\r/g) === -1 ? selection : '';
    }
    return '';
  };
}
