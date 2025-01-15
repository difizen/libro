/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
import type { CellView, LibroView } from '@difizen/libro-jupyter';
import {
  CellUri,
  LibroJupyterView,
  LibroService,
  MIME,
} from '@difizen/libro-jupyter';
import type { Container } from '@difizen/mana-app';
import { getOrigin } from '@difizen/mana-app';
import { Autowired, Injectable } from '@opensumi/di';
import { ClientAppContribution, URI } from '@opensumi/ide-core-browser';
import type { MaybePromise } from '@opensumi/ide-core-common';
import { Domain, Uri } from '@opensumi/ide-core-common';
import type {
  INotebookModelAddedData,
  NotebookCellDto,
  NotebookRawContentEventDto,
} from '@opensumi/ide-editor';
import {
  CellKind,
  NotebookCellsChangeType,
  WorkbenchEditorService,
} from '@opensumi/ide-editor';
import { IEditorDocumentModelService } from '@opensumi/ide-editor/lib/browser/doc-model/types';
import { NotebookService } from '@opensumi/ide-editor/lib/browser/notebook.service';
import type { ITextmateTokenizerService } from '@opensumi/ide-monaco/lib/browser/contrib/tokenizer';
import { ITextmateTokenizer } from '@opensumi/ide-monaco/lib/browser/contrib/tokenizer';

import { ManaContainer } from '../common';

import { LIBRO_COMPONENTS_SCHEME_ID } from './libro.protocol';
import { ILibroOpensumiService } from './libro.service';

@Injectable()
@Domain(ClientAppContribution)
export class NotebookServiceOverride
  extends NotebookService
  implements ClientAppContribution
{
  @Autowired(ManaContainer)
  private readonly manaContainer: Container;
  @Autowired(IEditorDocumentModelService)
  private readonly editorModelService: IEditorDocumentModelService;
  @Autowired(WorkbenchEditorService)
  private readonly workbenchEditorService: WorkbenchEditorService;
  @Autowired(ILibroOpensumiService)
  private readonly libroOpensumiService: ILibroOpensumiService;
  @Autowired(ITextmateTokenizer)
  private readonly textMateService: ITextmateTokenizerService;

  async initialize() {
    // monaco.languages.register({
    //   id,
    //   extensions: ['.sql'],
    //   aliases: ['sql', 'odps'],
    //   mimetypes: ['text/sql','application/vnd.libro.sql+json'],
    // });
    // monaco.languages.onLanguage(id, () => {
    //   console.log("🚀 ~ monaco.languages.onLanguage ~ id:", id)
    //   setTokensLanguage();
    // });

    // console.log("🚀 ~ setTokensLanguage ~ conf:", conf)
    try {
      import(
        /* webpackChunkName: "opensumi-textmate-languages" */ `@opensumi/textmate-languages/es/sql`
      )
        .then(({ default: loadLanguage }) => {
          loadLanguage(
            this.textMateService.registerLanguage.bind(this.textMateService),
            this.textMateService.registerGrammar.bind(this.textMateService),
          );
        })
        .catch((err) => {
          console.error(err.message);
          console.warn('sql', 'cannot load language');
        });
    } catch (err) {
      console.warn('sql', 'cannot load language');
    }
  }

  onDidStart(): MaybePromise<void> {
    this.listenLibro();
    this.listenEditor();
  }

  listenEditor() {
    this.workbenchEditorService.onActiveResourceChange((e) => {
      if (e?.uri?.path.ext === `.${LIBRO_COMPONENTS_SCHEME_ID}`) {
        this.libroOpensumiService
          .getOrCreatLibroView(e.uri)
          .then((libroView) => {
            this.handleOpenNotebook(libroView);
          });
      }
    });
  }

  protected notebookVersions = new Map<string, number>();

  protected getNotebookVersion(libroView: LibroView) {
    const uri = this.getNotebookUri(libroView as LibroJupyterView).toString();
    return this.notebookVersions.get(uri) ?? 1;
  }

  protected deleteNotebookVersion(libroView: LibroView) {
    const uri = this.getNotebookUri(libroView as LibroJupyterView).toString();
    return this.notebookVersions.delete(uri);
  }

  protected updateNotebookVersion(libroView: LibroView) {
    const uri = this.getNotebookUri(libroView as LibroJupyterView).toString();
    const versionId = this.notebookVersions.get(uri) ?? 1;
    this.notebookVersions.set(uri, versionId + 1);
  }

  protected isValidNotebook(view: LibroView): boolean {
    if (view instanceof LibroJupyterView) {
      return true;
    }
    return false;
  }

  isCodeCell(mime: string) {
    return ([MIME.odpssql, MIME.python] as string[]).includes(mime);
  }

  getCellURI(cell: CellView) {
    return CellUri.from(cell.parent.model.id, cell.model.id);
  }

  getCellModelRef(cell: CellView) {
    return this.editorModelService.getModelReference(
      URI.parse(this.getCellURI(cell).toString()),
    );
  }

  asNotebookCell(cell: CellView): NotebookCellDto {
    return {
      cellKind: this.isCodeCell(cell.model.mimeType)
        ? CellKind.Code
        : CellKind.Markup,
      eol: '\n',
      handle: 1,
      language: this.libroOpensumiService.getCellLangauge(cell) ?? 'plaintext',
      mime: cell.model.mimeType,
      outputs: [],
      source: cell.model.value.split('\n'),
      uri: Uri.parse(this.getCellURI(cell).toString()),
    };
  }

  getNotebookUri(notebook: LibroJupyterView) {
    return Uri.parse(notebook.model.filePath);
  }

  asNotebook(notebook: LibroJupyterView): INotebookModelAddedData {
    return {
      uri: this.getNotebookUri(notebook),
      viewType: 'jupyter-notebook',
      versionId: this.getNotebookVersion(notebook),
      cells: notebook.model.cells.map((item) => this.asNotebookCell(item)),
    };
  }

  listenLibro() {
    const libroService = this.manaContainer.get(LibroService);
    libroService.onNotebookViewCreated(this.handleOpenNotebook);
    libroService.onNotebookViewClosed((libroView) => {
      if (!this.isValidNotebook(libroView)) {
        return;
      }
      this.deleteNotebookVersion(libroView);
      this._onDidCloseNotebookDocument.fire(
        this.getNotebookUri(libroView as LibroJupyterView),
      );
    });
    libroService.onNotebookViewSaved((libroView) => {
      if (!this.isValidNotebook(libroView)) {
        return;
      }
      this.updateNotebookVersion(libroView);
      this._onDidSaveNotebookDocument.fire(
        this.getNotebookUri(libroView as LibroJupyterView),
      );
    });
    libroService.onNotebookViewChanged((event) => {
      if (!this.isValidNotebook(event.libroView)) {
        return;
      }

      if (!event.libroView.model.isInitialized) {
        return;
      }

      const events: NotebookRawContentEventDto[] = [];

      if (event.contentChanges) {
        event.contentChanges.forEach((item) => {
          if (item.addedCells.length > 0) {
            events.push({
              kind: NotebookCellsChangeType.ModelChange,
              changes: [
                [
                  item.range.start,
                  0,
                  item.addedCells.map((cell) => this.asNotebookCell(cell)),
                ],
              ],
            });
          }
          if (item.removedCells.length > 0) {
            events.push({
              kind: NotebookCellsChangeType.ModelChange,
              changes: [
                [item.range.start, item.range.end - item.range.start, []],
              ],
            });
          }
        });
      }

      this.updateNotebookVersion(event.libroView);
      this._onDidChangeNotebookDocument.fire({
        uri: this.getNotebookUri(event.libroView as LibroJupyterView),
        event: {
          rawEvents: events,
          versionId: 1,
        },
        isDirty: getOrigin(event.libroView.model.dirty),
      });
    });

    libroService.onNotebookCellChanged((event) => {
      const events: NotebookRawContentEventDto[] = [];
      const index = event.cell.parent.findCellIndex(event.cell);
      const modelRef = this.getCellModelRef(event.cell);
      events.push({
        kind: NotebookCellsChangeType.ChangeCellContent,
        index,
      });
      this._onDidChangeNotebookDocument.fire({
        uri: this.getNotebookUri(event.cell.parent as LibroJupyterView),
        event: {
          rawEvents: events,
          versionId: modelRef?.instance.getMonacoModel().getVersionId() ?? 1,
        },
        isDirty: getOrigin(event.cell.parent.model.dirty),
      });
    });
  }

  protected handleOpenNotebook = async (libroView: LibroView) => {
    if (!this.isValidNotebook(libroView)) {
      return;
    }
    await libroView.initialized;
    this.updateNotebookVersion(libroView);
    this._onDidOpenNotebookDocument.fire(
      this.asNotebook(libroView as LibroJupyterView),
    );
  };
}
