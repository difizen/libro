/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// import { PageConfig, URL } from '@jupyterlab/coreutils';
// import type { IDocumentWidget } from '@jupyterlab/docregistry';

import { URL } from '@difizen/libro-common';
import type { NotebookView } from '@difizen/libro-core';
import { PageConfig } from '@difizen/libro-kernel';
import type { Event } from '@difizen/mana-app';
import { Emitter, inject, singleton } from '@difizen/mana-app';
import type * as protocol from 'vscode-languageserver-protocol';

import type { WidgetLSPAdapter } from './adapters/adapter.js';
import type { LSPConnection } from './connection.js';
import { LSPConnectionFactory } from './connection.js';
import type { LspClientCapabilities } from './lsp.js';
import type { AskServersToSendTraceNotifications } from './plugin.js';
import type {
  Document,
  IDocumentConnectionData,
  ILanguageServerManager,
  ILSPConnection,
  ISocketConnectionOptions,
  TLanguageServerConfigurations,
  TLanguageServerId,
  TServerKeys,
} from './tokens.js';
import {
  ILSPDocumentConnectionManager,
  ILanguageServerManagerFactory,
} from './tokens.js';
import { expandDottedPaths, sleep, untilReady } from './utils.js';
import type { VirtualDocument } from './virtual/document.js';

/**
 * Each Widget with a document (whether file or a notebook) has the same DocumentConnectionManager
 * (see JupyterLabWidgetAdapter). Using id_path instead of uri led to documents being overwritten
 * as two identical id_paths could be created for two different notebooks.
 */
@singleton({ token: ILSPDocumentConnectionManager })
export class DocumentConnectionManager implements ILSPDocumentConnectionManager {
  @inject(LSPConnectionFactory)
  protected readonly lspConnectionFactory: LSPConnectionFactory;
  constructor(
    @inject(ILanguageServerManagerFactory)
    languageServerManagerFactory: ILanguageServerManagerFactory,
  ) {
    this.connections = new Map();
    this.documents = new Map();
    this.adapters = new Map();
    this._ignoredLanguages = new Set();
    this.languageServerManager = languageServerManagerFactory({});
  }

  private _connections: Map<TLanguageServerId, LSPConnection> = new Map();

  disconnectServer(languageServerId: TLanguageServerId): void {
    const connection = this._connections.get(languageServerId);
    if (connection) {
      connection.close();
      this._connections.delete(languageServerId);
      this.languageServerManager.refreshRunning();
    }
  }

  disconnectAllServers(): void {
    this.connections.forEach((connection, languageServerId) => {
      connection.close();
      this._connections.delete(languageServerId as TLanguageServerId);
    });

    this.languageServerManager.refreshRunning();
  }

  /**
   * Return (or create and initialize) the WebSocket associated with the language
   */
  protected async connection(
    language: string,
    languageServerId: TLanguageServerId,
    uris: IURIs,
    onCreate: (connection: LSPConnection) => void,
    capabilities: LspClientCapabilities,
  ): Promise<LSPConnection> {
    let connection = this._connections.get(languageServerId);
    if (!connection) {
      const socket = new WebSocket(uris.socket);

      const connection = this.lspConnectionFactory({
        languageId: language,
        serverUri: uris.server,
        rootUri: uris.base,
        serverIdentifier: languageServerId,
        capabilities: capabilities,
      });

      this._connections.set(languageServerId, connection);
      connection.connect(socket);
      onCreate(connection);
    }

    connection = this._connections.get(languageServerId)!;

    return connection;
  }

  protected updateServerConfiguration(
    languageServerId: TLanguageServerId,
    settings: protocol.DidChangeConfigurationParams,
  ): void {
    const connection = this._connections.get(languageServerId);
    if (connection) {
      connection.sendConfigurationChange(settings);
    }
  }

  /**
   * Map between the URI of the virtual document and its connection
   * to the language server
   */
  readonly connections: Map<VirtualDocument.uri, LSPConnection>;

  /**
   * Map between the path of the document and its adapter
   */
  readonly adapters: Map<string, WidgetLSPAdapter<NotebookView>>;

  /**
   * Map between the URI of the virtual document and the document itself.
   */
  readonly documents: Map<VirtualDocument.uri, VirtualDocument>;
  /**
   * The language server manager plugin.
   */
  readonly languageServerManager: ILanguageServerManager;

  /**
   * Initial configuration for the language servers.
   */
  initialConfigurations: TLanguageServerConfigurations;

  /**
   * Signal emitted when the manager is initialized.
   */
  get initialized(): Event<IDocumentConnectionData> {
    return this._initialized.event;
  }

  /**
   * Signal emitted when the manager is connected to the server
   */
  get connected(): Event<IDocumentConnectionData> {
    return this._connected.event;
  }

  /**
   * Connection temporarily lost or could not be fully established; a re-connection will be attempted;
   */
  get disconnected(): Event<IDocumentConnectionData> {
    return this._disconnected.event;
  }

  /**
   * Connection was closed permanently and no-reconnection will be attempted, e.g.:
   *  - there was a serious server error
   *  - user closed the connection,
   *  - re-connection attempts exceeded,
   */
  get closed(): Event<IDocumentConnectionData> {
    return this._closed.event;
  }

  /**
   * Signal emitted when the document is changed.
   */
  get documentsChanged(): Event<Map<VirtualDocument.uri, VirtualDocument>> {
    return this._documentsChanged.event;
  }

  /**
   * Promise resolved when the language server manager is ready.
   */
  get ready(): Promise<void> {
    return this.languageServerManager.ready;
  }

  /**
   * Generate the URI of a virtual document from input
   *
   * @param  virtualDocument - the virtual document
   * @param  language - language of the document
   */
  solveUris(virtualDocument: VirtualDocument, language: string): IURIs | undefined {
    const wsBase = PageConfig.getBaseUrl().replace(/^http/, 'ws');
    const rootUri = PageConfig.getOption('rootUri');
    const virtualDocumentsUri = PageConfig.getOption('virtualDocumentsUri');

    const baseUri = virtualDocument.hasLspSupportedFile ? rootUri : virtualDocumentsUri;

    // for now take the best match only
    const matchingServers = this.languageServerManager.getMatchingServers({
      language,
    });
    const languageServerId = matchingServers.length === 0 ? null : matchingServers[0];

    if (languageServerId === null) {
      return;
    }

    // workaround url-parse bug(s) (see https://github.com/jupyter-lsp/jupyterlab-lsp/issues/595)
    let documentUri = URL.join(baseUri, virtualDocument.uri);
    if (!documentUri.startsWith('file:///') && documentUri.startsWith('file://')) {
      documentUri = documentUri.replace('file://', 'file:///');
      if (
        documentUri.startsWith('file:///users/') &&
        baseUri.startsWith('file:///Users/')
      ) {
        documentUri = documentUri.replace('file:///users/', 'file:///Users/');
      }
    }

    return {
      base: baseUri,
      document: documentUri,
      server: URL.join('ws://jupyter-lsp', language),
      socket: URL.join(wsBase, 'lsp', 'ws', languageServerId),
    };
  }

  /**
   * Helper to connect various virtual document signal with callbacks of
   * this class.
   *
   * @param  virtualDocument - virtual document to be connected.
   */
  connectDocumentSignals(virtualDocument: VirtualDocument): void {
    virtualDocument.foreignDocumentOpened(this.onForeignDocumentOpened, this);

    virtualDocument.foreignDocumentClosed(this.onForeignDocumentClosed, this);
    this.documents.set(virtualDocument.uri, virtualDocument);
    this._documentsChanged.fire(this.documents);
  }

  /**
   * Helper to disconnect various virtual document signal with callbacks of
   * this class.
   *
   * @param  virtualDocument - virtual document to be disconnected.
   */
  disconnectDocumentSignals(virtualDocument: VirtualDocument, emit = true): void {
    this.documents.delete(virtualDocument.uri);
    for (const foreign of virtualDocument.foreignDocuments.values()) {
      this.disconnectDocumentSignals(foreign, false);
    }

    if (emit) {
      this._documentsChanged.fire(this.documents);
    }
  }

  /**
   * Handle foreign document opened event.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onForeignDocumentOpened(context: Document.IForeignContext): void {
    /** no-op */
  }

  /**
   * Handle foreign document closed event.
   */
  onForeignDocumentClosed(context: Document.IForeignContext): void {
    const { foreignDocument } = context;
    this.unregisterDocument(foreignDocument.uri, false);
    this.disconnectDocumentSignals(foreignDocument);
  }

  /**
   * Register a widget adapter with this manager
   *
   * @param  path - path to the inner document of the adapter
   * @param  adapter - the adapter to be registered
   */
  registerAdapter(path: string, adapter: WidgetLSPAdapter<NotebookView>): void {
    this.adapters.set(path, adapter);
    adapter.onDispose(() => {
      if (adapter.virtualDocument) {
        this.documents.delete(adapter.virtualDocument.uri);
      }
      this.adapters.delete(path);
    });
  }

  /**
   * Handles the settings that do not require an existing connection
   * with a language server (or can influence to which server the
   * connection will be created, e.g. `rank`).
   *
   * This function should be called **before** initialization of servers.
   */
  updateConfiguration(allServerSettings: TLanguageServerConfigurations): void {
    this.languageServerManager.setConfiguration(allServerSettings);
  }

  /**
   * Handles the settings that the language servers accept using
   * `onDidChangeConfiguration` messages, which should be passed under
   * the "serverSettings" keyword in the setting registry.
   * Other configuration options are handled by `updateConfiguration` instead.
   *
   * This function should be called **after** initialization of servers.
   */
  updateServerConfigurations(allServerSettings: TLanguageServerConfigurations): void {
    let languageServerId: TServerKeys;

    for (languageServerId in allServerSettings) {
      if (!Object.prototype.hasOwnProperty.call(allServerSettings, languageServerId)) {
        continue;
      }
      const rawSettings = allServerSettings[languageServerId]!;

      const parsedSettings = expandDottedPaths(rawSettings.configuration || {});

      const serverSettings: protocol.DidChangeConfigurationParams = {
        settings: parsedSettings,
      };

      this.updateServerConfiguration(languageServerId, serverSettings);
    }
  }

  /**
   * Fired the first time a connection is opened. These _should_ be the only
   * invocation of `.on` (once remaining LSPFeature.connection_handlers are made
   * singletons).
   */
  onNewConnection = (connection: LSPConnection): void => {
    const errorSignalSlot = (e: any): void => {
      console.error(e);
      const error: Error = e.length && e.length >= 1 ? e[0] : new Error();
      if (error.message.indexOf('code = 1005') !== -1) {
        console.error(`Connection failed for ${connection}`);
        this._forEachDocumentOfConnection(connection, (virtualDocument) => {
          console.error('disconnecting ' + virtualDocument.uri);
          this._closed.fire({ connection, virtualDocument });
          this._ignoredLanguages.add(virtualDocument.language);
          console.error(
            `Cancelling further attempts to connect ${virtualDocument.uri} and other documents for this language (no support from the server)`,
          );
        });
      } else if (error.message.indexOf('code = 1006') !== -1) {
        console.error('Connection closed by the server');
      } else {
        console.error('Connection error:', e);
      }
    };
    connection.errorSignal(errorSignalSlot);

    const serverInitializedSlot = (): void => {
      // Initialize using settings stored in the SettingRegistry
      this._forEachDocumentOfConnection(connection, (virtualDocument) => {
        // TODO: is this still necessary, e.g. for status bar to update responsively?
        this._initialized.fire({ connection, virtualDocument });
      });
      this.updateServerConfigurations(this.initialConfigurations);
    };
    connection.serverInitialized(serverInitializedSlot);

    const closeSignalSlot = (closedManually: boolean) => {
      if (!closedManually) {
        console.error('Connection unexpectedly disconnected');
      } else {
        console.warn('Connection closed');
        this._forEachDocumentOfConnection(connection, (virtualDocument) => {
          this._closed.fire({ connection, virtualDocument });
        });
      }
    };
    connection.closeSignal(closeSignalSlot);
  };

  /**
   * Retry to connect to the server each `reconnectDelay` seconds
   * and for `retrialsLeft` times.
   * TODO: presently no longer referenced. A failing connection would close
   * the socket, triggering the language server on the other end to exit.
   */
  async retryToConnect(
    options: ISocketConnectionOptions,
    reconnectDelay: number,
    retrialsLeft = -1,
  ): Promise<void> {
    const { virtualDocument } = options;

    if (this._ignoredLanguages.has(virtualDocument.language)) {
      return;
    }

    let interval = reconnectDelay * 1000;
    let success = false;

    while (retrialsLeft !== 0 && !success) {
      await this.connect(options)
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        .then(() => {
          success = true;
          return;
        })
        .catch((e) => {
          console.warn(e);
        });

      console.warn('will attempt to re-connect in ' + interval / 1000 + ' seconds');
      await sleep(interval);

      // gradually increase the time delay, up to 5 sec
      interval = interval < 5 * 1000 ? interval + 500 : interval;
    }
  }

  /**
   * Disconnect the connection to the language server of the requested
   * language.
   */
  disconnect(languageId: TLanguageServerId): void {
    this.disconnectServer(languageId);
  }

  /**
   * Create a new connection to the language server
   * @return A promise of the LSP connection
   */
  async connect(
    options: ISocketConnectionOptions,
    firstTimeoutSeconds = 30,
    secondTimeoutMinutes = 5,
  ): Promise<ILSPConnection | undefined> {
    const connection = await this._connectSocket(options);
    const { virtualDocument } = options;
    if (!connection) {
      return;
    }
    if (!connection.isReady) {
      try {
        // user feedback hinted that 40 seconds was too short and some users are willing to wait more;
        // to make the best of both worlds we first check frequently (6.6 times a second) for the first
        // 30 seconds, and show the warning early in case if something is wrong; we then continue retrying
        // for another 5 minutes, but only once per second.
        await untilReady(
          () => connection.isReady,
          Math.round((firstTimeoutSeconds * 1000) / 150),
          150,
        );
      } catch {
        console.warn(
          `Connection to ${virtualDocument.uri} timed out after ${firstTimeoutSeconds} seconds, will continue retrying for another ${secondTimeoutMinutes} minutes`,
        );
        try {
          await untilReady(() => connection.isReady, 60 * secondTimeoutMinutes, 1000);
        } catch {
          console.warn(
            `Connection to ${virtualDocument.uri} timed out again after ${secondTimeoutMinutes} minutes, giving up`,
          );
          return;
        }
      }
    }

    this._connected.fire({ connection, virtualDocument });

    return connection;
  }

  /**
   * Disconnect the signals of requested virtual document uri.
   */
  unregisterDocument(uri: string, emit = true): void {
    const connection = this.connections.get(uri);
    if (connection) {
      this.connections.delete(uri);
      const allConnection = new Set(this.connections.values());

      if (!allConnection.has(connection)) {
        this.disconnect(connection.serverIdentifier as TLanguageServerId);
        connection.dispose();
      }
      if (emit) {
        this._documentsChanged.fire(this.documents);
      }
    }
  }

  /**
   * Enable or disable the logging feature of the language servers
   */
  updateLogging(
    logAllCommunication: boolean,
    setTrace: AskServersToSendTraceNotifications,
  ): void {
    for (const connection of this.connections.values()) {
      connection.logAllCommunication = logAllCommunication;
      if (setTrace !== null) {
        connection.clientNotifications['$/setTrace'].fire({ value: setTrace });
      }
    }
  }

  /**
   * Create the LSP connection for requested virtual document.
   *
   * @return  Return the promise of the LSP connection.
   */

  protected async _connectSocket(
    options: ISocketConnectionOptions,
  ): Promise<LSPConnection | undefined> {
    const { language, capabilities, virtualDocument } = options;

    this.connectDocumentSignals(virtualDocument);

    const uris = this.solveUris(virtualDocument, language);
    const matchingServers = this.languageServerManager.getMatchingServers({
      language,
    });

    // for now use only the server with the highest rank.
    const languageServerId = matchingServers.length === 0 ? null : matchingServers[0];

    // lazily load 1) the underlying library (1.5mb) and/or 2) a live WebSocket-
    // like connection: either already connected or potentially in the process
    // of connecting.
    if (!uris) {
      return;
    }
    const connection = await this.connection(
      language,
      languageServerId!,
      uris,
      this.onNewConnection,
      capabilities,
    );

    // if connecting for the first time, all documents subsequent documents will
    // be re-opened and synced
    this.connections.set(virtualDocument.uri, connection);

    return connection;
  }

  /**
   * Helper to apply callback on all documents of a connection.
   */
  protected _forEachDocumentOfConnection(
    connection: ILSPConnection,
    callback: (virtualDocument: VirtualDocument) => void,
  ) {
    for (const [virtualDocumentUri, currentConnection] of this.connections.entries()) {
      if (connection !== currentConnection) {
        continue;
      }
      callback(this.documents.get(virtualDocumentUri)!);
    }
  }

  protected _initialized = new Emitter<IDocumentConnectionData>();

  protected _connected = new Emitter<IDocumentConnectionData>();

  protected _disconnected = new Emitter<IDocumentConnectionData>();

  protected _closed = new Emitter<IDocumentConnectionData>();

  protected _documentsChanged = new Emitter<
    Map<VirtualDocument.uri, VirtualDocument>
  >();

  /**
   * Set of ignored languages
   */
  protected _ignoredLanguages: Set<string>;
}
export interface IURIs {
  /**
   * The root URI set by server.
   *
   */
  base: string;

  /**
   * The URI to the virtual document.
   *
   */
  document: string;

  /**
   * Address of websocket endpoint for LSP services.
   *
   */
  server: string;

  /**
   * Address of websocket endpoint for the language server.
   *
   */
  socket: string;
}
