import { CellUri } from '@difizen/libro-common';
import type { CellView, LibroView } from '@difizen/libro-core';
import { ExecutableNotebookModel } from '@difizen/libro-kernel';
import type { NotebookCell, NotebookDocument, NotebookRange } from 'vscode';

import { unsupported } from './util.js';
import { EndOfLine, NotebookCellKind, Uri } from './vscodeAdaptor.js';

export const l2c = {
  asNotebookDocument(libroView: LibroView): NotebookDocument {
    const model = libroView.model as any;
    if (!ExecutableNotebookModel.is(model)) {
      throw new Error('invalid libro jupyter model');
    }
    const filePath = model.filePath as string;
    return {
      uri: Uri.parse(filePath),
      notebookType: 'jupyter',
      version: libroView.model.version,
      isDirty: libroView.model.dirty,
      isUntitled: false,
      isClosed: false,
      metadata: libroView.model.metadata,
      cellCount: libroView.model.executeCount,
      cellAt: unsupported,
      getCells(range?: NotebookRange): NotebookCell[] {
        return libroView.model.cells.map(l2c.asNotebookCell);
      },
      save: unsupported,
    };
  },

  asNotebookCell(cell: CellView): NotebookCell {
    const model = cell.parent.model as any;
    if (model.filePath === undefined) {
      throw new Error('no filePath: invalid libro jupyter model');
    }
    const filePath = model.filePath as string;
    return {
      index: cell.parent.findCellIndex(cell),
      notebook: l2c.asNotebookDocument(cell.parent),
      kind:
        cell.model.type === 'code' ? NotebookCellKind.Code : NotebookCellKind.Markup,
      document: {
        uri: Uri.parse(CellUri.from(filePath, cell.model.id).toString()),
        fileName: filePath,
        isUntitled: false,
        languageId: 'python',
        version: cell.model.version,
        isDirty: false,
        isClosed: false,
        save: unsupported,
        eol: EndOfLine.LF,
        lineCount: 0,
        lineAt: unsupported,
        offsetAt: unsupported,
        positionAt: unsupported,
        getText: () => {
          return cell.model.value;
        },
        getWordRangeAtPosition: unsupported,
        validateRange: unsupported,
        validatePosition: unsupported,
      },
      metadata: cell.model.metadata,
      outputs: [],
      executionSummary: undefined,
    };
  },
};
