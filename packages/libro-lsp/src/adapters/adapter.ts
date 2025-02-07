// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import type { NotebookView } from '@difizen/libro-core';
import { Emitter, injectable } from '@difizen/libro-common/app';
import type { Disposable, Event, View } from '@difizen/libro-common/app';
import type {} from '@difizen/libro-common/app';
import mergeWith from 'lodash.mergewith';

import type { LspClientCapabilities, LanguageIdentifier } from '../lsp.js';
import type { IVirtualPosition } from '../positioning.js';
import type {
  Document,
  IDocumentConnectionData,
  ILSPCodeExtractorsManager,
  ILSPDocumentConnectionManager,
  ILSPFeatureManager,
  ISocketConnectionOptions,
} from '../tokens.js';
import type { VirtualDocument } from '../virtual/document.js';

/**
 * The values should follow the https://microsoft.github.io/language-server-protocol/specification guidelines
 */
const MIME_TYPE_LANGUAGE_MAP: Record<string, string> = {
  'text/x-rsrc': 'r',
  'text/x-r-source': 'r',
  // currently there are no LSP servers for IPython we are aware of
  'text/x-ipython': 'python',
};

export interface IEditorChangedData {
  /**
   * The CM editor invoking the change event.
   */
  editor: Document.IEditor;
}

export interface IAdapterOptions {
  /**
   * The LSP document and connection manager instance.
   */
  connectionManager: ILSPDocumentConnectionManager;

  /**
   * The LSP feature manager instance.
   */
  featureManager: ILSPFeatureManager;

  /**
   * The LSP foreign code extractor manager.
   */
  foreignCodeExtractorsManager: ILSPCodeExtractorsManager;
}

/**
 * Foreign code: low level adapter is not aware of the presence of foreign languages;
 * it operates on the virtual document and must not attempt to infer the language dependencies
 * as this would make the logic of inspections caching impossible to maintain, thus the WidgetAdapter
 * has to handle that, keeping multiple connections and multiple virtual documents.
 */
@injectable()
export abstract class WidgetLSPAdapter<T extends NotebookView> implements Disposable {
  // note: it could be using namespace/IOptions pattern,
  // but I do not know how to make it work with the generic type T
  // (other than using 'any' in the IOptions interface)
  constructor(
    public widget: T,
    protected options: IAdapterOptions,
  ) {
    this._connectionManager = options.connectionManager;
    this._isConnected = false;
    // set up signal connections
    this.widget.onSave(this.onSaveState);
    // this.widget.context.saveState.connect(this.onSaveState, this);
    // this.connectionManager.closed.connect(this.onConnectionClosed, this);
    // this.widget.disposed.connect(this.dispose, this);
  }

  /**
   * Check if the adapter is disposed
   */
  get disposed(): boolean {
    return this._isDisposed;
  }
  /**
   * Check if the document contains multiple editors
   */
  get hasMultipleEditors(): boolean {
    return this.editors.length > 1;
  }
  /**
   * Get the ID of the internal widget.
   */
  get widgetId(): string {
    return this.widget.id;
  }

  /**
   * Get the language identifier of the document
   */
  get language(): LanguageIdentifier {
    // the values should follow https://microsoft.github.io/language-server-protocol/specification guidelines,
    // see the table in https://microsoft.github.io/language-server-protocol/specification#textDocumentItem
    if (Object.prototype.hasOwnProperty.call(MIME_TYPE_LANGUAGE_MAP, this.mimeType)) {
      return MIME_TYPE_LANGUAGE_MAP[this.mimeType];
    } else {
      const withoutParameters = this.mimeType.split(';')[0];
      const [type, subtype] = withoutParameters.split('/');
      if (type === 'application' || type === 'text') {
        if (subtype.startsWith('x-')) {
          return subtype.substring(2);
        } else {
          return subtype;
        }
      } else {
        return this.mimeType;
      }
    }
  }

  /**
   * Signal emitted when the adapter is connected.
   */
  get adapterConnected(): Event<IDocumentConnectionData> {
    return this._adapterConnected.event;
  }

  /**
   * Signal emitted when the active editor have changed.
   */
  get activeEditorChanged(): Event<IEditorChangedData> {
    return this._activeEditorChanged.event;
  }

  /**
   * Signal emitted when the adapter is disposed.
   */
  get onDispose(): Event<void> {
    return this._disposed.event;
  }

  /**
   * Signal emitted when the an editor is changed.
   */
  get editorAdded(): Event<IEditorChangedData> {
    return this._editorAdded.event;
  }

  /**
   * Signal emitted when the an editor is removed.
   */
  get editorRemoved(): Event<IEditorChangedData> {
    return this._editorRemoved.event;
  }

  /**
   * Get the inner HTMLElement of the document widget.
   */
  abstract get wrapperElement(): HTMLElement;

  /**
   * Get current path of the document.
   */
  abstract get documentPath(): string;

  /**
   * Get the mime type of the document.
   */
  abstract get mimeType(): string;

  /**
   * Get the file extension of the document.
   */
  abstract get languageFileExtension(): string | undefined;

  /**
   * Get the activated CM editor.
   */
  abstract get activeEditor(): Document.IEditor | undefined;

  /**
   * Get the list of CM editors in the document, there is only one editor
   * in the case of file editor.
   */
  abstract get editors(): Document.ICodeBlockOptions[];

  /**
   * Promise that resolves once the adapter is initialized
   */
  abstract get ready(): Promise<void>;

  /**
   * The virtual document is connected or not
   */
  get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * The LSP document and connection manager instance.
   */
  get connectionManager(): ILSPDocumentConnectionManager {
    return this._connectionManager;
  }

  /**
   * Promise that resolves once the document is updated
   */
  get updateFinished(): Promise<void> {
    return this._updateFinished;
  }

  /**
   * Internal virtual document of the adapter.
   */
  get virtualDocument(): VirtualDocument | null {
    return this._virtualDocument;
  }

  /**
   * Callback on connection closed event.
   */
  onConnectionClosed(
    _: ILSPDocumentConnectionManager,
    { virtualDocument }: IDocumentConnectionData,
  ): void {
    if (virtualDocument === this.virtualDocument) {
      this.dispose();
    }
  }

  /**
   * Dispose the adapter.
   */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    this.disconnect();
    this._virtualDocument = null;
    this._disposed.fire();
  }

  /**
   * Disconnect virtual document from the language server.
   */
  disconnect(): void {
    const uri = this.virtualDocument?.uri;
    if (uri) {
      this.connectionManager.unregisterDocument(uri);
    }

    // pretend that all editors were removed to trigger the disconnection of even handlers
    // they will be connected again on new connection
    for (const { ceEditor: editor } of this.editors) {
      this._editorRemoved.fire({
        editor: editor,
      });
    }

    this.virtualDocument?.dispose();
  }

  /**
   * Update the virtual document.
   */
  updateDocuments(): Promise<void> {
    if (this._isDisposed) {
      console.warn('Cannot update documents: adapter disposed');
      return Promise.reject('Cannot update documents: adapter disposed');
    }
    return this.virtualDocument!.updateManager.updateDocuments(this.editors);
  }

  /**
   * Callback called on the document changed event.
   */
  documentChanged(virtualDocument: VirtualDocument): void {
    if (this._isDisposed) {
      console.warn('Cannot swap document: adapter disposed');
      return;
    }

    // TODO only send the difference, using connection.sendSelectiveChange()
    const connection = this.connectionManager.connections.get(virtualDocument.uri);

    if (!connection?.isReady) {
      console.warn('Skipping document update signal: connection not ready');
      return;
    }

    connection.sendFullTextChange(virtualDocument.value, virtualDocument.documentInfo);
  }

  /**
   * (re)create virtual document using current path and language
   */
  protected abstract createVirtualDocument(): VirtualDocument;

  /**
   * Get the index of editor from the cursor position in the virtual
   * document. Since there is only one editor, this method always return
   * 0
   *
   * @param position - the position of cursor in the virtual document.
   * @return - index of the virtual editor
   */
  abstract getEditorIndexAt(position: IVirtualPosition): number;

  /**
   * Get the index of input editor
   *
   * @param ceEditor - instance of the code editor
   */
  abstract getEditorIndex(ceEditor: Document.IEditor): number;

  /**
   * Get the index of input editor
   *
   * @param ceEditor - instance of the code editor
   */
  abstract getCellEditor(cell: View): Document.IEditor | undefined;

  /**
   * Get the wrapper of input editor.
   *
   * @param ceEditor
   */
  abstract getEditorWrapper(ceEditor: Document.IEditor): HTMLElement | undefined;

  // equivalent to triggering didClose and didOpen, as per syncing specification,
  // but also reloads the connection; used during file rename (or when it was moved)
  protected reloadConnection(): void {
    // ignore premature calls (before the editor was initialized)
    if (this.virtualDocument === null) {
      return;
    }

    // disconnect all existing connections (and dispose adapters)
    this.disconnect();

    // recreate virtual document using current path and language
    // as virtual editor assumes it gets the virtual document at init,
    // just dispose virtual editor (which disposes virtual document too)
    // and re-initialize both virtual editor and document
    this.initVirtual();

    // reconnect
    this.connectDocument(this.virtualDocument, true).catch(console.warn);
  }

  /**
   * Callback on document saved event.
   */
  protected onSaveState = (): void => {
    // ignore premature calls (before the editor was initialized)
    if (this.virtualDocument === null) {
      return;
    }

    const documentsToSave = [this.virtualDocument];

    for (const virtualDocument of documentsToSave) {
      const connection = this.connectionManager.connections.get(virtualDocument.uri);
      if (!connection) {
        continue;
      }
      connection.sendSaved(virtualDocument.documentInfo);
      for (const foreign of virtualDocument.foreignDocuments.values()) {
        documentsToSave.push(foreign);
      }
    }
  };

  /**
   * Connect the virtual document with the language server.
   */
  protected async onConnected(data: IDocumentConnectionData): Promise<void> {
    const { virtualDocument } = data;

    this._adapterConnected.fire(data);
    this._isConnected = true;

    try {
      await this.updateDocuments();
    } catch (reason) {
      console.warn('Could not update documents', reason);
      return;
    }

    // refresh the document on the LSP server
    this.documentChanged(virtualDocument);

    data.connection.serverNotifications['$/logTrace'].event((message) => {
      console.warn(
        data.connection.serverIdentifier,
        'trace',
        virtualDocument.uri,
        message,
      );
    });

    data.connection.serverNotifications['window/logMessage'].event((message) => {
      console.warn(data.connection.serverIdentifier + ': ' + message.message);
    });

    data.connection.serverNotifications['window/showMessage'].event((message) => {
      // void showDialog({
      //   title: this.trans.__('Message from ') + connection.serverIdentifier,
      //   body: message.message,
      // });
      alert(`Message from ${data.connection.serverIdentifier}: ${message.message}`);
    });

    data.connection.serverRequests['window/showMessageRequest'].setHandler(
      async (params) => {
        alert(`Message from ${data.connection.serverIdentifier}: ${params.message}`);
        return null;

        // const actionItems = params.actions;
        // const buttons = actionItems
        //   ? actionItems.map(action => {
        //       return createButton({
        //         label: action.title,
        //       });
        //     })
        //   : [createButton({ label: this.trans.__('Dismiss') })];
        // const result = await showDialog<IButton>({
        //   title: this.trans.__('Message from ') + data.connection.serverIdentifier,
        //   body: params.message,
        //   buttons: buttons,
        // });
        // const choice = buttons.indexOf(result.button);
        // if (choice === -1) {
        //   return null;
        // }
        // if (actionItems) {
        //   return actionItems[choice];
        // }
        // return null;
      },
    );
  }

  /**
   * Opens a connection for the document. The connection may or may
   * not be initialized, yet, and depending on when this is called, the client
   * may not be fully connected.
   *
   * @param virtualDocument a VirtualDocument
   * @param sendOpen whether to open the document immediately
   */
  protected async connectDocument(
    virtualDocument: VirtualDocument,
    sendOpen = false,
  ): Promise<void> {
    virtualDocument.foreignDocumentOpened(this.onForeignDocumentOpened, this);
    const connectionContext = await this._connect(virtualDocument).catch(console.error);

    if (connectionContext && connectionContext.connection) {
      virtualDocument.changed(this.documentChanged, this);
      if (sendOpen) {
        connectionContext.connection.sendOpenWhenReady(virtualDocument.documentInfo);
      }
    }
  }

  /**
   * Create the virtual document using current path and language.
   */
  protected initVirtual(): void {
    const { model } = this.widget;
    this._virtualDocument?.dispose();
    this._virtualDocument = this.createVirtualDocument();
    model.onSourceChanged?.(() => this._onContentChanged());
  }

  /**
   * Handler for opening a document contained in a parent document. The assumption
   * is that the editor already exists for this, and as such the document
   * should be queued for immediate opening.
   *
   * @param host the VirtualDocument that contains the VirtualDocument in another language
   * @param context information about the foreign VirtualDocument
   */
  protected async onForeignDocumentOpened(
    context: Document.IForeignContext,
  ): Promise<void> {
    const { foreignDocument } = context;

    await this.connectDocument(foreignDocument, true);

    foreignDocument.foreignDocumentClosed(this._onForeignDocumentClosed, this);
  }

  /**
   * Signal emitted when the adapter is connected.
   */
  protected _adapterConnected = new Emitter<IDocumentConnectionData>();

  /**
   * Signal emitted when the active editor have changed.
   */
  protected _activeEditorChanged = new Emitter<IEditorChangedData>();

  /**
   * Signal emitted when an editor is changed.
   */
  protected _editorAdded = new Emitter<IEditorChangedData>();

  /**
   * Signal emitted when an editor is removed.
   */
  protected _editorRemoved = new Emitter<IEditorChangedData>();

  /**
   * Signal emitted when the adapter is disposed.
   */
  protected _disposed = new Emitter<void>();

  protected _isDisposed = false;

  protected readonly _connectionManager: ILSPDocumentConnectionManager;

  protected _isConnected: boolean;
  protected _updateFinished: Promise<void>;
  protected _virtualDocument: VirtualDocument | null = null;

  /**
   * Callback called when a foreign document is closed,
   * the associated signals with this virtual document
   * are disconnected.
   */
  protected _onForeignDocumentClosed(context: Document.IForeignContext): void {
    // const { foreignDocument } = context;
  }

  /**
   * Detect the capabilities for the document type then
   * open the websocket connection with the language server.
   */
  protected async _connect(virtualDocument: VirtualDocument) {
    const language = virtualDocument.language;

    let capabilities: LspClientCapabilities = {
      textDocument: {
        synchronization: {
          dynamicRegistration: true,
          willSave: false,
          didSave: true,
          willSaveWaitUntil: false,
        },
      },
      workspace: {
        didChangeConfiguration: {
          dynamicRegistration: true,
        },
      },
    };
    capabilities = mergeWith(
      capabilities,
      this.options.featureManager.clientCapabilities(),
    );

    const options: ISocketConnectionOptions = {
      capabilities,
      virtualDocument,
      language,
      hasLspSupportedFile: virtualDocument.hasLspSupportedFile,
    };

    const connection = await this.connectionManager.connect(options);

    if (connection) {
      await this.onConnected({ virtualDocument, connection });

      return {
        connection,
        virtualDocument,
      };
    } else {
      return undefined;
    }
  }

  /**
   * Handle content changes and update all virtual documents after a change.
   *
   * #### Notes
   * Update to the state of a notebook may be done without a notice on the
   * CodeMirror level, e.g. when a cell is deleted. Therefore a
   * JupyterLab-specific signal is watched instead.
   *
   * While by not using the change event of CodeMirror editors we lose an easy
   * way to send selective (range) updates this can be still implemented by
   * comparison of before/after states of the virtual documents, which is
   * more resilient and editor-independent.
   */
  protected async _onContentChanged() {
    // Update the virtual documents.
    // Sending the updates to LSP is out of scope here.
    const promise = this.updateDocuments();
    if (!promise) {
      console.warn('Could not update documents');
      return;
    }
    this._updateFinished = promise.catch(console.warn);
    await this.updateFinished;
  }
}
