import type { LibroView } from '@difizen/libro-core';
import { LibroService } from '@difizen/libro-core';
import { inject, noop, singleton } from '@difizen/mana-app';
import type {
  NotebookDocument,
  WorkspaceFolder,
  Event,
  WorkspaceFoldersChangeEvent,
  ConfigurationChangeEvent,
  ConfigurationScope,
  WorkspaceConfiguration,
  WorkspaceEdit,
  WorkspaceEditMetadata,
  NotebookDocumentChangeEvent,
  TextDocumentWillSaveEvent,
  TextDocumentChangeEvent,
  FileCreateEvent,
  FileRenameEvent,
  FileWillRenameEvent,
  FileDeleteEvent,
  FileWillDeleteEvent,
  FileWillCreateEvent,
  GlobPattern,
  FileSystemWatcher,
  Uri,
  TextDocument,
  FileSystem,
} from 'vscode';

import { l2c } from './convertor.js';
import { Range } from './extHostTypes.js';
import { LibroFileWatcher } from './fileWatcher.js';
import { LibroFS } from './libro-fs.js';
import { ILibroWorkspace } from './services.js';
import { unsupported } from './util.js';

@singleton({ token: ILibroWorkspace })
export class LibroWorkspace implements ILibroWorkspace {
  @inject(LibroService) private readonly libroService: LibroService;

  isValidNotebook(view: LibroView): boolean {
    if ((view as any).lspEnabled === true) {
      return true;
    }
    return false;
  }

  workspaceFolders: WorkspaceFolder[] | undefined = [];
  getWorkspaceFolder(uri: Uri): WorkspaceFolder | undefined {
    return;
  }
  get notebookDocuments(): NotebookDocument[] {
    return Array.from(this.libroService.getViewCache().values()).map(
      l2c.asNotebookDocument,
    );
  }
  textDocuments: TextDocument[] = [];
  fs: FileSystem = new LibroFS();
  onDidChangeWorkspaceFolders: Event<WorkspaceFoldersChangeEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onDidChangeConfiguration: Event<ConfigurationChangeEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  getConfiguration(
    section?: string | undefined,
    scope?: ConfigurationScope | null | undefined,
  ): WorkspaceConfiguration {
    return {
      get: noop,
      has: () => false,
      update: async () => {
        //noop
      },
      inspect: noop,
    } as WorkspaceConfiguration;
  }
  applyEdit(edit: WorkspaceEdit, metadata?: WorkspaceEditMetadata): Thenable<boolean> {
    return Promise.resolve(true);
  }
  onDidOpenNotebookDocument: Event<NotebookDocument> = (
    listener,
    thisArgs,
    disposables,
  ) => {
    const disposable = this.libroService.onNotebookViewCreated((libroView) => {
      if (!this.isValidNotebook(libroView)) {
        return;
      }
      listener(l2c.asNotebookDocument(libroView));
    });
    disposables?.push(disposable);
    return disposable;
  };
  onDidSaveNotebookDocument: Event<NotebookDocument> = (
    listener,
    thisArgs,
    disposables,
  ) => {
    const disposable = this.libroService.onNotebookViewSaved((libroView) => {
      if (!this.isValidNotebook(libroView)) {
        return;
      }
      listener(l2c.asNotebookDocument(libroView));
    });
    disposables?.push(disposable);
    return disposable;
  };
  onDidCloseNotebookDocument: Event<NotebookDocument> = (
    listener,
    thisArgs,
    disposables,
  ) => {
    const disposable = this.libroService.onNotebookViewClosed((libroView) => {
      if (!this.isValidNotebook(libroView)) {
        return;
      }
      listener(l2c.asNotebookDocument(libroView));
    });
    disposables?.push(disposable);
    return disposable;
  };
  onDidChangeNotebookDocument: Event<NotebookDocumentChangeEvent> = (
    listener,
    thisArgs,
    disposables,
  ) => {
    const disposable = this.libroService.onNotebookViewChanged((e) => {
      if (!this.isValidNotebook(e.libroView)) {
        return;
      }
      listener({
        notebook: l2c.asNotebookDocument(e.libroView),
        metadata: {},
        cellChanges: [],
        contentChanges: e.contentChanges.map((item) => {
          return {
            range: {
              start: item.range.start,
              end: item.range.end,
              isEmpty: item.range.start === item.range.end,
              with: unsupported,
            },
            addedCells: item.addedCells.map(l2c.asNotebookCell),
            removedCells: item.removedCells.map(l2c.asNotebookCell),
          };
        }),
      });
    });
    disposables?.push(disposable);
    return disposable;
  };

  onDidOpenTextDocument: Event<TextDocument> = (listener) => {
    return this.libroService.onNotebookCellCreated((cells) => {
      cells.forEach((cell) => {
        listener(l2c.asNotebookCell(cell).document);
      });
    });
  };
  onDidSaveTextDocument: Event<TextDocument> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onWillSaveTextDocument: Event<TextDocumentWillSaveEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onDidCloseTextDocument: Event<TextDocument> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onDidChangeTextDocument: Event<TextDocumentChangeEvent> = (listener, thisArgs) => {
    return this.libroService.onNotebookCellChanged((e) => {
      return listener.call(thisArgs, {
        document: l2c.asNotebookCell(e.cell).document,
        contentChanges: e.changes.map((change) => {
          return {
            range: new Range(
              change.range.start.line,
              change.range.start.column,
              change.range.end.line,
              change.range.end.column,
            ),
            rangeLength: change.rangeLength,
            rangeOffset: change.rangeOffset,
            text: change.text,
          };
        }),
        reason: undefined,
      });
    });
  };
  onDidCreateFiles: Event<FileCreateEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onDidRenameFiles: Event<FileRenameEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onWillRenameFiles: Event<FileWillRenameEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onDidDeleteFiles: Event<FileDeleteEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onWillDeleteFiles: Event<FileWillDeleteEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onWillCreateFiles: Event<FileWillCreateEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  createFileSystemWatcher(
    pattern: GlobPattern,
    optionsOrIgnoreCreate: any,
    ignoreChange?: boolean,
    ignoreDelete?: boolean,
  ): FileSystemWatcher {
    return new LibroFileWatcher();
  }
}
