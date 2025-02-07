import { CellUri } from '@difizen/libro-common';
import {
  EditorCellView,
  ILibroWorkspaceService,
  LibroService,
} from '@difizen/libro-core';
import { ExecutableNotebookModel } from '@difizen/libro-kernel';
import {
  ApplicationContribution,
  inject,
  singleton,
} from '@difizen/libro-common/mana-app';
import * as monaco from '@difizen/monaco-editor-core';
import { URI } from 'vscode-uri';

import { CloseAction, ErrorAction } from './common/api.js';
import { LSPEnv } from './common/vscodeAdaptor/lspEnv.js';
import { workspace } from './common/vscodeAdaptor/vscodeAdaptor.js';
import { LibroLanguageClientManager } from './libro-language-client-manager.js';
import { toEditorRange, toMonacoPosition } from './util.js';

@singleton({ contrib: [ApplicationContribution] })
export class LibroLanguageClientContribution implements ApplicationContribution {
  @inject(ILibroWorkspaceService)
  protected readonly libroWorkspaceService: ILibroWorkspaceService;
  @inject(LibroLanguageClientManager)
  protected readonly libroLanguageClientManager: LibroLanguageClientManager;

  @inject(LSPEnv)
  protected readonly lspEnv: LSPEnv;

  @inject(LibroService)
  protected readonly libroService: LibroService;

  async onViewStart() {
    // not block
    this.startLanguageClients();
    this.setupEditorOpener();
  }

  async startLanguageClients() {
    // wait for workspaceFolder
    await this.libroWorkspaceService.ready;
    await this.lspEnv.ready;
    const serverIds = await this.libroLanguageClientManager.getServers();

    for (const serverId of serverIds) {
      await this.libroLanguageClientManager.getOrCreateLanguageClient(serverId, {
        name: `${serverId} Language Client`,
        clientOptions: {
          // use a language id as a document selector
          documentSelector: [{ language: 'python' }],
          // disable the default error handler
          errorHandler: {
            error: () => ({ action: ErrorAction.Continue }),
            closed: () => ({ action: CloseAction.DoNotRestart }),
          },
          synchronize: {
            fileEvents: [workspace.createFileSystemWatcher('**', false)],
          },
        },
      });
    }

    this.libroLanguageClientManager
      .getFeatureStatus('textDocument/formatting')
      .then((status) => {
        this.libroService.hasFormatter = status;
        return;
      })
      .catch(() => {
        return;
      });
  }

  setupEditorOpener() {
    monaco.editor.registerEditorOpener({
      openCodeEditor: (source, resource, selectionOrPosition) => {
        // simulate openening a new browser tab for our own type (open definition of alert)
        const model = monaco.editor.getModel(resource);
        if (model?.id === source.getModel()?.id) {
          return true;
        }
        const libroView = Array.from(this.libroService.getViewCache().values()).find(
          (item) => {
            return (
              ExecutableNotebookModel.is(item.model) &&
              URI.parse(item.model.filePath).path === resource.path
            );
          },
        );

        if (!libroView) {
          return false;
        }

        const cell = libroView.model.cells.find((item) => {
          return (
            ExecutableNotebookModel.is(libroView.model) &&
            CellUri.from(libroView.model.filePath, item.model.id).toString() ===
              decodeURIComponent(resource.toString())
          );
        });

        if (EditorCellView.is(cell)) {
          libroView.selectCell(cell);
          cell.editor?.focus();
          let line = 0;
          if (monaco.Range.isIRange(selectionOrPosition)) {
            cell.editor?.revealSelection(toEditorRange(selectionOrPosition));
            cell.editor?.setCursorPosition(toEditorRange(selectionOrPosition).start);
            line = toEditorRange(selectionOrPosition).start.line;
          } else {
            cell.editor?.setCursorPosition(toMonacoPosition(selectionOrPosition));
            line = toMonacoPosition(selectionOrPosition).line;
          }
          libroView.model.scrollToView(cell, (line ?? 0) * 20);
          return false;
        }

        // alternatively set model directly in the editor if you have your own tab/navigation implementation
        // const model = monaco.editor.getModel(resource);
        // editor.setModel(model);
        // if (monaco.Range.isIRange(selectionOrPosition)) {
        // 	editor.revealRangeInCenterIfOutsideViewport(selectionOrPosition);
        // 	editor.setSelection(selectionOrPosition);
        // } else {
        // 	editor.revealPositionInCenterIfOutsideViewport(selectionOrPosition);
        // 	editor.setPosition(selectionOrPosition);
        // }

        return false;
      },
    });
  }
}
