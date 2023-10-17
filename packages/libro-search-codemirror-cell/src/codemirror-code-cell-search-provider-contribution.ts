import type { CodeMirrorEditor } from '@difizen/libro-codemirror';
import { LibroCodeCellView } from '@difizen/libro-codemirror-code-cell';
import type { CellView } from '@difizen/libro-core';
import { CellSearchProviderContribution } from '@difizen/libro-search';
import { inject, singleton } from '@difizen/mana-app';
import { ViewManager } from '@difizen/mana-app';

import { CodeMirrorCodeCellSearchProviderFactory } from './codemirror-search-protocol.js';

@singleton({ contrib: CellSearchProviderContribution })
export class CodeMirrorCodeCellSearchProviderContribution
  implements CellSearchProviderContribution
{
  @inject(ViewManager) viewManager: ViewManager;
  @inject(CodeMirrorCodeCellSearchProviderFactory)
  providerfactory: CodeMirrorCodeCellSearchProviderFactory;
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
      const editor = cell?.editor as CodeMirrorEditor | undefined;
      const selection = editor?.state.sliceDoc(
        editor?.state.selection.main.from,
        editor?.state.selection.main.to,
      );
      // if there are newlines, just return empty string
      return selection?.search(/\r?\n|\r/g) === -1 ? selection : '';
    }
    return '';
  };
}
