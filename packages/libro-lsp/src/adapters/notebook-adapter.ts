/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-parameter-properties */
/* eslint-disable @typescript-eslint/parameter-properties */
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import type * as nbformat from '@difizen/libro-common';
import { MIME } from '@difizen/libro-common';
import type {
  CellView,
  CellViewChange,
  LibroModel,
  LibroView,
} from '@difizen/libro-core';
import { EditorCellView } from '@difizen/libro-core';
import type { ExecutableNotebookModel } from '@difizen/libro-kernel';
import {} from '@difizen/libro-common/mana-app';
import { inject, transient, watch, Deferred } from '@difizen/libro-common/mana-app';

import type { IVirtualPosition } from '../positioning.js';
import type { Document } from '../tokens.js';
import { untilReady } from '../utils.js';
import type { VirtualDocument } from '../virtual/document.js';
import { VirtualDocumentFactory } from '../virtual/document.js';

import type { IAdapterOptions } from './adapter.js';
import { WidgetLSPAdapter } from './adapter.js';

type ILanguageInfoMetadata = nbformat.ILanguageInfoMetadata;

export const NotebookAdapterFactory = Symbol('NotebookAdapterFactory');
export type NotebookAdapterFactory = (
  options: NotebookAdapterOptions,
) => NotebookAdapter;
export const NotebookAdapterOptions = Symbol('NotebookAdapterOptions');
export interface NotebookAdapterOptions extends IAdapterOptions {
  editorWidget: LibroView;
}

@transient()
export class NotebookAdapter extends WidgetLSPAdapter<LibroView> {
  @inject(VirtualDocumentFactory) protected readonly docFactory: VirtualDocumentFactory;
  constructor(@inject(NotebookAdapterOptions) options: NotebookAdapterOptions) {
    const editorWidget = options.editorWidget;
    super(editorWidget, options);
    this._editorToCell = new Map();
    this.editor = editorWidget;
    this._cellToEditor = new WeakMap();
    Promise.all([this.notebookModel.kcReady, this.connectionManager.ready])
      .then(async () => {
        await this.initOnceReady();
        this._readyDelegate.resolve();
        return;
      })
      .catch(console.error);
  }

  /**
   * The wrapped `Notebook` widget.
   */
  readonly editor: LibroView;

  get notebookModel() {
    return this.widget.model as ExecutableNotebookModel;
  }

  get fileContents() {
    return this.notebookModel.currentFileContents;
  }

  /**
   * Get current path of the document.
   */
  get documentPath(): string {
    return this.fileContents.path;
  }

  /**
   * Get the mime type of the document.
   */
  get mimeType(): string {
    let mimeType: string | string[];
    const languageMetadata = this.language_info();
    if (!languageMetadata || !languageMetadata.mimetype) {
      // fallback to the code cell mime type if no kernel in use
      mimeType = this.fileContents.mimetype!;
    } else {
      mimeType = languageMetadata.mimetype;
    }
    return Array.isArray(mimeType) ? (mimeType[0] ?? 'text/plain') : mimeType;
  }

  /**
   * Get the file extension of the document.
   */
  get languageFileExtension(): string | undefined {
    const languageMetadata = this.language_info();
    if (!languageMetadata || !languageMetadata.file_extension) {
      return;
    }
    return languageMetadata.file_extension.replace('.', '');
  }

  /**
   * Get the inner HTMLElement of the document widget.
   */
  get wrapperElement(): HTMLElement {
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    return this.widget.container?.current!;
  }

  /**
   *  Get the list of CM editor with its type in the document,
   */
  get editors(): Document.ICodeBlockOptions[] {
    if (this.disposed) {
      return [];
    }

    this._editorToCell.clear();

    return this.editor.model.cells
      .filter((item) => EditorCellView.is(item) && item.model.mimeType === MIME.python)
      .map((cell) => {
        return {
          ceEditor: this.getCellEditor(cell)!,
          type: cell.model.type,
          value: cell.model.value,
        };
      });
  }

  /**
   * Get the activated CM editor.
   */
  get activeEditor(): Document.IEditor | undefined {
    return this.editor.activeCell
      ? this.getCellEditor(this.editor.activeCell)
      : undefined;
  }

  /**
   * Promise that resolves once the adapter is initialized
   */
  get ready(): Promise<void> {
    return this._readyDelegate.promise;
  }

  /**
   * Get the index of editor from the cursor position in the virtual
   * document.
   *
   * @param position - the position of cursor in the virtual document.
   */
  getEditorIndexAt(position: IVirtualPosition): number {
    const cell = this._getCellAt(position);
    return this.editor.model.cells.findIndex((otherCell) => {
      return cell === otherCell;
    });
  }

  /**
   * Get the index of input editor
   *
   * @param ceEditor - instance of the code editor
   */
  getEditorIndex(ceEditor: Document.IEditor): number {
    const cell = this._editorToCell.get(ceEditor)!;
    return this.editor.model.cells.findIndex((otherCell) => {
      return cell === otherCell;
    });
  }

  /**
   * Get the wrapper of input editor.
   *
   * @param ceEditor - instance of the code editor
   */
  getEditorWrapper(ceEditor: Document.IEditor): HTMLElement | undefined {
    const cell = this._editorToCell.get(ceEditor)!;
    return EditorCellView.is(cell) ? cell.editor?.host : undefined;
  }

  /**
   * Callback on kernel changed event, it will disconnect the
   * document with the language server and then reconnect.
   *
   * @param _session - Session context of changed kernel
   * @param change - Changed data
   */
  onKernelChanged = async (): Promise<void> => {
    try {
      // note: we need to wait until ready before updating language info
      const oldLanguageInfo = this._languageInfo;
      await untilReady(this.isReady, -1);
      await this._updateLanguageInfo();
      const newLanguageInfo = this._languageInfo;
      if (
        oldLanguageInfo?.name !== newLanguageInfo.name ||
        oldLanguageInfo?.mimetype !== newLanguageInfo?.mimetype ||
        oldLanguageInfo?.file_extension !== newLanguageInfo?.file_extension
      ) {
        console.warn(`Changed to ${this._languageInfo.name} kernel, reconnecting`);
        this.reloadConnection();
      } else {
        console.warn(
          'Keeping old LSP connection as the new kernel uses the same langauge',
        );
      }
    } catch (err) {
      console.warn(err);
      // try to reconnect anyway
      this.reloadConnection();
    }
  };

  /**
   * Dispose the widget.
   */
  override dispose(): void {
    if (this.disposed) {
      return;
    }

    super.dispose();

    // editors are needed for the parent dispose() to unbind signals, so they are the last to go
    this._editorToCell.clear();
  }

  /**
   * Method to check if the notebook context is ready.
   */
  isReady(): boolean {
    return (
      !this.widget.isDisposed &&
      // this.notebookModel.currentKernelStatus !== undefined &&
      this.widget.isVisible &&
      this.notebookModel.cells.length > 0 &&
      this.notebookModel.kernelConnection !== null
    );
  }

  handleCellSourceChange = async () => {
    await this.updateDocuments();
  };

  /**
   * Update the virtual document on cell changing event.
   *
   * @param cells - Observable list of changed cells
   * @param change - Changed data
   */
  handleCellChange = async (change: CellViewChange): Promise<void> => {
    // const cellsAdded: ICellModel[] = [];
    // const cellsRemoved: ICellModel[] = [];
    // const type = this._type;
    // if (change.type === 'set') {
    //   // handling of conversions is important, because the editors get re-used and their handlers inherited,
    //   // so we need to clear our handlers from editors of e.g. markdown cells which previously were code cells.
    //   const convertedToMarkdownOrRaw = [];
    //   const convertedToCode = [];

    //   if (change.newValues.length === change.oldValues.length) {
    //     // during conversion the cells should not get deleted nor added
    //     for (let i = 0; i < change.newValues.length; i++) {
    //       if (change.oldValues[i].type === type && change.newValues[i].type !== type) {
    //         convertedToMarkdownOrRaw.push(change.newValues[i]);
    //       } else if (change.oldValues[i].type !== type && change.newValues[i].type === type) {
    //         convertedToCode.push(change.newValues[i]);
    //       }
    //     }
    //     cellsAdded = convertedToCode;
    //     cellsRemoved = convertedToMarkdownOrRaw;
    //   }
    // } else if (change.type == 'add') {
    //   cellsAdded = change.newValues.filter(cellModel => cellModel.type === type);
    // }
    // note: editorRemoved is not emitted for removal of cells by change of type 'remove' (but only during cell type conversion)
    // because there is no easy way to get the widget associated with the removed cell(s) - because it is no
    // longer in the notebook widget list! It would need to be tracked on our side, but it is not necessary
    // as (except for a tiny memory leak) it should not impact the functionality in any way

    // if (
    //   cellsRemoved.length ||
    //   cellsAdded.length ||
    //   change.type === 'set' ||
    //   change.type === 'move' ||
    //   change.type === 'remove'
    // ) {
    // in contrast to the file editor document which can be only changed by the modification of the editor content,
    // the notebook document cna also get modified by a change in the number or arrangement of editors themselves;
    // for this reason each change has to trigger documents update (so that LSP mirror is in sync).
    await this.updateDocuments();
    // }

    for (const cellView of change.insert?.cells ?? []) {
      // const cellWidget = this.widget.content.widgets.find(cell => cell.model.id === cellModel.id);
      // if (!cellWidget) {
      //   console.warn(`Widget for added cell with ID: ${cellModel.id} not found!`);
      //   continue;
      // }

      // Add editor to the mapping if needed
      this.getCellEditor(cellView);
    }
  };

  /**
   * Generate the virtual document associated with the document.
   */
  createVirtualDocument(): VirtualDocument {
    return this.docFactory({
      language: this.language,
      foreignCodeExtractors: this.options.foreignCodeExtractorsManager,
      path: this.documentPath,
      fileExtension: this.languageFileExtension,
      // notebooks are continuous, each cell is dependent on the previous one
      standalone: false,
      // notebooks are not supported by LSP servers
      hasLspSupportedFile: false,
    });
  }

  /**
   * Get the metadata of notebook.
   */
  protected language_info(): ILanguageInfoMetadata {
    return this._languageInfo;
  }
  /**
   * Initialization function called once the editor and the LSP connection
   * manager is ready. This function will create the virtual document and
   * connect various signals.
   */
  protected initOnceReady = async (): Promise<void> => {
    await untilReady(this.isReady.bind(this), -1);
    await this._updateLanguageInfo();
    this.initVirtual();

    // connect the document, but do not open it as the adapter will handle this
    // after registering all features
    this.connectDocument(this.virtualDocument!, false).catch((error) => {
      console.warn(error);
    });

    // this.widget.context.sessionContext.kernelChanged.connect(this.onKernelChanged, this);
    watch(this.notebookModel, 'kernelConnection', this.onKernelChanged);

    watch(this.notebookModel, 'active', ({ target }) =>
      this._activeCellChanged(target),
    );

    this._connectModelSignals(this.widget);
  };

  /**
   * Connect the cell changed event to its handler
   *
   * @param  notebook - The notebook that emitted event.
   */
  protected _connectModelSignals(notebook: LibroView) {
    if (notebook.model === null) {
      console.warn(
        `Model is missing for notebook ${notebook}, cannot connect cell changed signal!`,
      );
    } else {
      notebook.model.onSourceChanged(this.handleCellSourceChange);
      notebook.model.onCellViewChanged(this.handleCellChange);
    }
  }

  /**
   * Update the stored language info with the one from the notebook.
   */
  protected async _updateLanguageInfo(): Promise<void> {
    const language_info = (await this.notebookModel.kernelConnection?.info)
      ?.language_info;
    // const language_info = (await this.widget.context.sessionContext?.session?.kernel?.info)
    //   ?.language_info;
    if (language_info) {
      this._languageInfo = language_info;
    } else {
      throw new Error(
        'Language info update failed (no session, kernel, or info available)',
      );
    }
  }

  /**
   * Handle the cell changed event
   * @param  notebook - The notebook that emitted event
   * @param cell - Changed cell.
   */
  protected _activeCellChanged(libroModel: LibroModel | null) {
    if (!libroModel || libroModel.active?.model.type !== this._type) {
      return;
    }

    if (libroModel.active) {
      this._activeEditorChanged.fire({
        editor: this.getCellEditor(libroModel.active)!,
      });
    }
  }

  /**
   * Get the cell at the cursor position of the virtual document.
   * @param  pos - Position in the virtual document.
   */
  protected _getCellAt(pos: IVirtualPosition): CellView {
    const editor = this.virtualDocument!.getEditorAtVirtualLine(pos);
    return this._editorToCell.get(editor)!;
  }

  /**
   * Get the cell editor and add new ones to the mappings.
   *
   * @param cell Cell widget
   * @returns Cell editor accessor
   */
  getCellEditor(cell: CellView): Document.IEditor | undefined {
    if (!EditorCellView.is(cell)) {
      return;
    }
    if (!this._cellToEditor.has(cell)) {
      const editor = Object.freeze({
        getEditor: () => cell.editor!,
        ready: async () => {
          // await cell.ready;
          return cell.editor!;
        },
        reveal: async () => {
          // await this.editor.scrollToCell(cell);
          return cell.editor!;
        },
      });

      this._cellToEditor.set(cell, editor);
      this._editorToCell.set(editor, cell);
      cell.onDisposed(() => {
        this._cellToEditor.delete(cell);
        this._editorToCell.delete(editor);
        this._editorRemoved.fire({
          editor,
        });
      });

      this._editorAdded.fire({
        editor,
      });
    }

    return this._cellToEditor.get(cell)!;
  }

  /**
   * A map between the editor accessor and the containing cell
   */
  protected _editorToCell: Map<Document.IEditor, CellView>;

  /**
   * Mapping of cell to editor accessor to ensure accessor uniqueness.
   */
  protected _cellToEditor: WeakMap<CellView, Document.IEditor>;

  /**
   * Metadata of the notebook
   */
  protected _languageInfo: ILanguageInfoMetadata;

  protected _type: nbformat.CellType = 'code';

  protected _readyDelegate = new Deferred<void>();
}
