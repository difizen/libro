/* eslint-disable @typescript-eslint/no-namespace */
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// import type { ServerConnection } from '@jupyterlab/services';

import type { IEditor as ICodeEditor } from '@difizen/libro-code-editor';
import type { NotebookView } from '@difizen/libro-core';
import type { Disposable, Emitter, Event } from '@difizen/mana-app';
import type * as rpc from 'vscode-jsonrpc';
import type * as lsp from 'vscode-languageserver-protocol';

import type { WidgetLSPAdapter } from './adapters/adapter.js';
import type { IURIs } from './connection-manager.js';
import type { IForeignCodeExtractor } from './extractors/types.js';
import type {
  AnyCompletion,
  AnyLocation,
  ClientCapabilities,
  LanguageIdentifier,
} from './lsp.js';
import type { LanguageServer1 as LSPLanguageServerSettings } from './plugin.js';
import type * as SCHEMA from './schema.js';
import type { VirtualDocument } from './virtual/document.js';
import type {
  IDocumentInfo,
  ILspConnection,
  ILspOptions,
} from './ws-connection/types.js';

export { IDocumentInfo };

/**
 * Example server keys==ids that are expected. The list is not exhaustive.
 * Custom server keys are allowed. Constraining the values helps avoid errors,
 * but at runtime any value is allowed.
 */
export type TLanguageServerId =
  | 'pyright-extended'
  | 'pyright'
  | 'pylsp'
  | 'bash-language-server'
  | 'dockerfile-language-server-nodejs'
  | 'javascript-typescript-langserver'
  | 'unified-language-server'
  | 'vscode-css-languageserver-bin'
  | 'vscode-html-languageserver-bin'
  | 'vscode-json-languageserver-bin'
  | 'yaml-language-server'
  | 'r-languageserver';

/**
 * Type alias for the server ids.
 */
export type TServerKeys = TLanguageServerId;

/**
 * Type of language server configuration, it is a map between server
 * id and its setting.
 */
export type TLanguageServerConfigurations = Partial<
  Record<TServerKeys, LSPLanguageServerSettings>
>;

/**
 * Type of language server session, it is a map between server
 * id and the associated session.
 */
export type TSessionMap = Map<TServerKeys, SCHEMA.LanguageServerSession>;

/**
 * Type of language server specs, it is a map between server
 * id and the associated specs.
 */
export type TSpecsMap = Map<TServerKeys, SCHEMA.LanguageServerSpec>;

/**
 * Type alias for language server id, it helps to clarify other types.
 */
export type TLanguageId = string;

// export const ILanguageServerManager = Symbol('ILanguageServerManager');

export interface ILanguageServerManager extends Disposable {
  refreshRunning: () => Promise<void>;

  /**
   * @alpha
   *
   * Signal emitted when the language server sessions are changed.
   */
  sessionsChanged: Event<void>;

  /**
   * @alpha
   *
   * The current session information of running language servers.
   */
  readonly sessions: TSessionMap;

  /**
   * @alpha
   *
   * A promise that is fulfilled when the connection manager is ready.
   */
  readonly ready: Promise<void>;

  /**
   * @alpha
   *
   * Current endpoint to get the status of running language servers
   */
  readonly statusUrl: string;

  /**
   * @alpha
   *
   * Status code of the `fetchSession` request.
   */
  readonly statusCode: number;

  /**
   * @alpha
   *
   * Check if the manager is enabled or disabled
   */
  readonly isEnabled: boolean;

  /**
   * @alpha
   *
   * Enable the language server services
   */
  enable(): void;

  /**
   * @alpha
   *
   * Disable the language server services
   */
  disable(): void;

  /**
   * @alpha
   *
   * An ordered list of matching >running< sessions, with servers of higher rank higher in the list
   */
  getMatchingServers(options: IGetServerIdOptions): TLanguageServerId[];

  /**
   * @alpha
   *
   * A list of all known matching specs (whether detected or not).
   */
  getMatchingSpecs(options: IGetServerIdOptions): TSpecsMap;

  /**
   * @alpha
   *
   * Set the configuration for language servers
   */
  setConfiguration(configuration: TLanguageServerConfigurations): void;

  /**
   * @alpha
   *
   * Send a request to language server handler to get the session information.
   */
  fetchSessions(): Promise<void>;
}

/**
 * Virtual document namespace
 */
export namespace Document {
  /**
   * Code block description.
   */
  export interface ICodeBlockOptions {
    /**
     * CodeEditor accessor
     */
    ceEditor: IEditor;

    /**
     * Type of the cell holding this block
     */
    type: string;

    /**
     * Editor text
     *
     * #### Notes
     * This must always be available and should come from the document model directly.
     */
    value: string;
  }

  /**
   * Code editor accessor.
   */
  export interface IEditor {
    /**
     * CodeEditor getter.
     *
     * It will return `null` if the editor is not yet instantiated;
     * e.g. to support windowed notebook.
     */
    getEditor(): ICodeEditor | null;

    /**
     * Promise getter that resolved when the editor is instantiated.
     */
    ready(): Promise<ICodeEditor>;

    /**
     * Reveal the code editor in viewport.
     *
     * ### Notes
     * The promise will resolve when the editor is instantiated and in
     * the viewport.
     */
    reveal(): Promise<ICodeEditor>;
  }

  /**
   * Foreign context within code block.
   */
  export interface IForeignContext {
    /**
     * The virtual document
     */
    foreignDocument: VirtualDocument;

    /**
     * The document holding the virtual document.
     */
    parentHost: VirtualDocument;
  }

  /**
   * Virtual document block.
   */
  export interface IVirtualDocumentBlock {
    /**
     * Line corresponding to the block in the entire foreign document
     */
    virtualLine: number;

    /**
     * The virtual document holding this virtual line.
     */
    virtualDocument: VirtualDocument;

    /**
     * The CM editor associated with this virtual line.
     */
    editor: IEditor;
  }
}

/**
 * LSP endpoint prefix.
 */
export const URL_NS = 'lsp';

export const ILanguageServerManagerFactory = Symbol('ILanguageServerManagerFactory');

export type ILanguageServerManagerFactory = (
  option: ILanguageServerManagerOptions,
) => ILanguageServerManager;

export const ILanguageServerManagerOptions = Symbol('ILanguageServerManagerOptions');

export interface ILanguageServerManagerOptions {
  /**
   * The Jupyter server settings objec
   */
  // settings?: ServerConnection.ISettings;

  /**
   * Base URL of current JupyterLab server.
   */
  baseUrl?: string;

  /**
   * Number of connection retries to fetch the sessions.
   * Default 2.
   */
  retries?: number;

  /**
   * The interval for retries, default 10 seconds.
   */
  retriesInterval?: number;
}
/**
 * The argument for getting server session or specs.
 */
export interface IGetServerIdOptions {
  /**
   * Language server id
   */
  language?: TLanguageId;

  /**
   * Server specs mime type.
   */
  mimeType?: string;
}

/**
 * Option to create the websocket connection to the LSP proxy server
 * on the backend.
 */
export interface ISocketConnectionOptions {
  /**
   * The virtual document trying to connect to the LSP server.
   */
  virtualDocument: VirtualDocument;

  /**
   * The language identifier, corresponding to the API endpoint on the
   * LSP proxy server.
   */
  language: string;

  /**
   * LSP capabilities describing currently supported features
   */
  capabilities: ClientCapabilities;

  /**
   * Is the file format is supported by LSP?
   */
  hasLspSupportedFile: boolean;
}

/**
 * @alpha
 *
 * Interface describing the LSP connection state
 */
export interface IDocumentConnectionData {
  /**
   * The virtual document connected to the language server
   */
  virtualDocument: VirtualDocument;
  /**
   * The connection between the virtual document and the language server.
   */
  connection: ILSPConnection;
}

export const ILSPDocumentConnectionManager = Symbol('ILSPDocumentConnectionManager');

/**
 * @alpha
 *
 * The LSP connection state manager
 */
export interface ILSPDocumentConnectionManager {
  disconnectServer: (languageServerId: TLanguageServerId) => void;

  disconnectAllServers: () => void;

  /**
   * The mapping of document uri to the  connection to language server.
   */
  connections: Map<VirtualDocument.uri, ILSPConnection>;

  /**
   * The mapping of document uri to the virtual document.
   */
  documents: Map<VirtualDocument.uri, VirtualDocument>;

  /**
   * The mapping of document uri to the widget adapter.
   */
  adapters: Map<string, WidgetLSPAdapter<NotebookView>>;

  /**
   * Signal emitted when a connection is connected.
   */
  connected: Event<IDocumentConnectionData>;

  /**
   * Signal emitted when a connection is disconnected.
   */
  disconnected: Event<IDocumentConnectionData>;

  /**
   * Signal emitted when the language server is initialized.
   */
  initialized: Event<IDocumentConnectionData>;

  /**
   * Signal emitted when a virtual document is closed.
   */
  closed: Event<IDocumentConnectionData>;

  /**
   * Signal emitted when the content of a virtual document is changed.
   */
  documentsChanged: Event<Map<VirtualDocument.uri, VirtualDocument>>;

  /**
   * The language server manager instance.
   */
  languageServerManager: ILanguageServerManager;

  /**
   * A promise that is fulfilled when the connection manager is ready.
   */
  readonly ready: Promise<void>;

  /**
   * Handles the settings that do not require an existing connection
   * with a language server (or can influence to which server the
   * connection will be created, e.g. `rank`).
   *
   * This function should be called **before** initialization of servers.
   */
  updateConfiguration(allServerSettings: TLanguageServerConfigurations): void;

  /**
   * Handles the settings that the language servers accept using
   * `onDidChangeConfiguration` messages, which should be passed under
   * the "serverSettings" keyword in the setting registry.
   * Other configuration options are handled by `updateConfiguration` instead.
   *
   * This function should be called **after** initialization of servers.
   */
  updateServerConfigurations(allServerSettings: TLanguageServerConfigurations): void;

  /**
   * Retry to connect to the server each `reconnectDelay` seconds
   * and for `retrialsLeft` times.
   */
  retryToConnect(
    options: ISocketConnectionOptions,
    reconnectDelay: number,
    retrialsLeft: number,
  ): Promise<void>;

  /**
   * Create a new connection to the language server
   * @return A promise of the LSP connection
   */
  connect(
    options: ISocketConnectionOptions,
    firstTimeoutSeconds?: number,
    secondTimeoutMinute?: number,
  ): Promise<ILSPConnection | undefined>;

  /**
   * Disconnect the connection to the language server of the requested
   * language.
   */
  disconnect(languageId: TLanguageServerId): void;

  /**
   * Disconnect the signals of requested virtual document uri.
   */
  unregisterDocument(uri: string): void;

  /**
   * Register a widget adapter.
   *
   * @param  path - path to current document widget of input adapter
   * @param  adapter - the adapter need to be registered
   */
  registerAdapter(path: string, adapter: WidgetLSPAdapter<NotebookView>): void;

  solveUris(virtualDocument: VirtualDocument, language: string): IURIs | undefined;
}

/**
 * @alpha
 *
 * Interface describing the client feature
 */
export interface IFeature {
  /**
   * The feature identifier. It must be the same as the feature plugin id.
   */
  id: string;

  /**
   * LSP capabilities implemented by the feature.
   */
  capabilities?: ClientCapabilities;
}

export const ILSPFeatureManager = Symbol('ILSPFeatureManager');

/**
 * @alpha
 *
 * The LSP feature manager
 */
export interface ILSPFeatureManager {
  /**
   * A read-only registry of all registered features.
   */
  readonly features: IFeature[];

  /**
   * Register the new feature (frontend capability)
   * for one or more code editor implementations.
   */
  register(feature: IFeature): void;

  /**
   * Signal emitted when a feature is registered
   */
  featuresRegistered: Event<IFeature>;

  /**
   * Get capabilities of all registered features
   */
  clientCapabilities(): ClientCapabilities;
}

export const ILSPCodeExtractorsManager = Symbol('ILSPCodeExtractorsManager');

/**
 * @alpha
 *
 * Manages code transclusion plugins.
 */
export interface ILSPCodeExtractorsManager {
  /**
   * Get the foreign code extractors.
   */
  getExtractors(cellType: string, hostLanguage: string | null): IForeignCodeExtractor[];

  /**
   * Register the extraction rules to be applied in documents with language `host_language`.
   */
  register(
    extractor: IForeignCodeExtractor,
    hostLanguage: LanguageIdentifier | null,
  ): void;
}

export const ILSPOptions = Symbol('ILSPOptions');
/**
 * Argument for creating a connection to the LSP proxy server.
 */
export interface ILSPOptions extends ILspOptions {
  /**
   * Client capabilities implemented by the client.
   */
  capabilities: ClientCapabilities;

  /**
   * Language server id.
   */
  serverIdentifier?: string;
}

/**
 * Method strings are reproduced here because a non-typing import of
 * `vscode-languageserver-protocol` is ridiculously expensive.
 */
export namespace Method {
  /** Server notifications */
  export enum ServerNotification {
    PUBLISH_DIAGNOSTICS = 'textDocument/publishDiagnostics',
    SHOW_MESSAGE = 'window/showMessage',
    LOG_TRACE = '$/logTrace',
    LOG_MESSAGE = 'window/logMessage',
  }

  /** Client notifications */
  export enum ClientNotification {
    DID_CHANGE = 'textDocument/didChange',
    DID_CHANGE_CONFIGURATION = 'workspace/didChangeConfiguration',
    DID_OPEN = 'textDocument/didOpen',
    DID_SAVE = 'textDocument/didSave',
    INITIALIZED = 'initialized',
    SET_TRACE = '$/setTrace',
  }

  /** Server requests */
  export enum ServerRequest {
    REGISTER_CAPABILITY = 'client/registerCapability',
    SHOW_MESSAGE_REQUEST = 'window/showMessageRequest',
    UNREGISTER_CAPABILITY = 'client/unregisterCapability',
    WORKSPACE_CONFIGURATION = 'workspace/configuration',
  }

  /** Client requests */
  export enum ClientRequest {
    COMPLETION = 'textDocument/completion',
    COMPLETION_ITEM_RESOLVE = 'completionItem/resolve',
    DEFINITION = 'textDocument/definition',
    DOCUMENT_HIGHLIGHT = 'textDocument/documentHighlight',
    DOCUMENT_SYMBOL = 'textDocument/documentSymbol',
    HOVER = 'textDocument/hover',
    IMPLEMENTATION = 'textDocument/implementation',
    INITIALIZE = 'initialize',
    REFERENCES = 'textDocument/references',
    RENAME = 'textDocument/rename',
    SIGNATURE_HELP = 'textDocument/signatureHelp',
    TYPE_DEFINITION = 'textDocument/typeDefinition',
    FORMATTING = 'textDocument/formatting',
    RANGE_FORMATTING = 'textDocument/rangeFormatting',
  }
}

/**
 * Interface describing the notifications that come from the server.
 */
export interface IServerNotifyParams {
  [Method.ServerNotification.LOG_MESSAGE]: lsp.LogMessageParams;
  [Method.ServerNotification.LOG_TRACE]: rpc.LogTraceParams;
  [Method.ServerNotification.PUBLISH_DIAGNOSTICS]: lsp.PublishDiagnosticsParams;
  [Method.ServerNotification.SHOW_MESSAGE]: lsp.ShowMessageParams;
}

/**
 * Interface describing the notifications that come from the client.
 */
export interface IClientNotifyParams {
  [Method.ClientNotification
    .DID_CHANGE_CONFIGURATION]: lsp.DidChangeConfigurationParams;
  [Method.ClientNotification.DID_CHANGE]: lsp.DidChangeTextDocumentParams;
  [Method.ClientNotification.DID_OPEN]: lsp.DidOpenTextDocumentParams;
  [Method.ClientNotification.DID_SAVE]: lsp.DidSaveTextDocumentParams;
  [Method.ClientNotification.INITIALIZED]: lsp.InitializedParams;
  [Method.ClientNotification.SET_TRACE]: rpc.SetTraceParams;
}

/**
 * Interface describing the requests sent to the server.
 */
export interface IServerRequestParams {
  [Method.ServerRequest.REGISTER_CAPABILITY]: lsp.RegistrationParams;
  [Method.ServerRequest.SHOW_MESSAGE_REQUEST]: lsp.ShowMessageRequestParams;
  [Method.ServerRequest.UNREGISTER_CAPABILITY]: lsp.UnregistrationParams;
  [Method.ServerRequest.WORKSPACE_CONFIGURATION]: lsp.ConfigurationParams;
}

/**
 * Interface describing the responses received from the server.
 */
export interface IServerResult {
  [Method.ServerRequest.REGISTER_CAPABILITY]: void;
  [Method.ServerRequest.SHOW_MESSAGE_REQUEST]: lsp.MessageActionItem | null;
  [Method.ServerRequest.UNREGISTER_CAPABILITY]: void;
  [Method.ServerRequest.WORKSPACE_CONFIGURATION]: any[];
}

/**
 * Interface describing the request sent to the client.
 */
export interface IClientRequestParams {
  [Method.ClientRequest.COMPLETION_ITEM_RESOLVE]: lsp.CompletionItem;
  [Method.ClientRequest.COMPLETION]: lsp.CompletionParams;
  [Method.ClientRequest.DEFINITION]: lsp.TextDocumentPositionParams;
  [Method.ClientRequest.DOCUMENT_HIGHLIGHT]: lsp.TextDocumentPositionParams;
  [Method.ClientRequest.DOCUMENT_SYMBOL]: lsp.DocumentSymbolParams;
  [Method.ClientRequest.HOVER]: lsp.TextDocumentPositionParams;
  [Method.ClientRequest.IMPLEMENTATION]: lsp.TextDocumentPositionParams;
  [Method.ClientRequest.INITIALIZE]: lsp.InitializeParams;
  [Method.ClientRequest.REFERENCES]: lsp.ReferenceParams;
  [Method.ClientRequest.RENAME]: lsp.RenameParams;
  [Method.ClientRequest.SIGNATURE_HELP]: lsp.TextDocumentPositionParams;
  [Method.ClientRequest.TYPE_DEFINITION]: lsp.TextDocumentPositionParams;
  [Method.ClientRequest.FORMATTING]: lsp.DocumentFormattingParams;
  [Method.ClientRequest.RANGE_FORMATTING]: lsp.DocumentRangeFormattingParams;
}

/**
 * Interface describing the responses received from the client.
 */
export interface IClientResult {
  [Method.ClientRequest.COMPLETION_ITEM_RESOLVE]: lsp.CompletionItem;
  [Method.ClientRequest.COMPLETION]: AnyCompletion;
  [Method.ClientRequest.DEFINITION]: AnyLocation;
  [Method.ClientRequest.DOCUMENT_HIGHLIGHT]: lsp.DocumentHighlight[];
  [Method.ClientRequest.DOCUMENT_SYMBOL]: lsp.DocumentSymbol[];
  [Method.ClientRequest.HOVER]: lsp.Hover | null;
  [Method.ClientRequest.IMPLEMENTATION]: AnyLocation;
  [Method.ClientRequest.INITIALIZE]: lsp.InitializeResult;
  [Method.ClientRequest.REFERENCES]: lsp.Location[] | null;
  [Method.ClientRequest.RENAME]: lsp.WorkspaceEdit;
  [Method.ClientRequest.SIGNATURE_HELP]: lsp.SignatureHelp;
  [Method.ClientRequest.TYPE_DEFINITION]: AnyLocation;
  [Method.ClientRequest.FORMATTING]: lsp.TextEdit[] | null;
  [Method.ClientRequest.RANGE_FORMATTING]: lsp.TextEdit[] | null;
}

/**
 * Type of server notification handlers, it is a map between the server
 * notification name and the associated `ISignal`.
 */
export type ServerNotifications<
  T extends keyof IServerNotifyParams = keyof IServerNotifyParams,
> = {
  readonly [key in T]: Emitter<IServerNotifyParams[key]>;
};

/**
 * Type of client notification handlers, it is a map between the client
 * notification name and the associated signal.
 */
export type ClientNotifications<
  T extends keyof IClientNotifyParams = keyof IClientNotifyParams,
> = {
  readonly [key in T]: Emitter<IClientNotifyParams[key]>;
};

/**
 * Interface describing the client request handler.
 */
export interface IClientRequestHandler<
  T extends keyof IClientRequestParams = keyof IClientRequestParams,
> {
  request(params: IClientRequestParams[T]): Promise<IClientResult[T]>;
}

/**
 * Interface describing the server request handler.
 */
export interface IServerRequestHandler<
  T extends keyof IServerRequestParams = keyof IServerRequestParams,
> {
  setHandler(
    handler: (
      params: IServerRequestParams[T],
      connection?: ILSPConnection,
    ) => Promise<IServerResult[T]>,
  ): void;
  clearHandler(): void;
}

/**
 * Type of client request handlers, it is a map between the client
 * request name and the associated handler.
 */
export type ClientRequests<
  T extends keyof IClientRequestParams = keyof IClientRequestParams,
> = {
  // has async request(params) returning a promise with result.
  readonly [key in T]: IClientRequestHandler<key>;
};

/**
 * Type of server request handlers, it is a map between the server
 * request name and the associated handler.
 */
export type ServerRequests<
  T extends keyof IServerRequestParams = keyof IServerRequestParams,
> = {
  // has async request(params) returning a promise with result.
  readonly [key in T]: IServerRequestHandler<key>;
};

/**
 * @alpha
 *
 * Interface describing the connection to the language server.
 */
export interface ILSPConnection extends ILspConnection {
  /**
   * @alpha
   *
   * Identifier of the language server
   */
  serverIdentifier?: string;

  /**
   * @alpha
   *
   * Language of the language server
   */
  serverLanguage?: string;

  /**
   * @alpha
   *
   * Should log all communication?
   */
  logAllCommunication: boolean;

  /**
   * @alpha
   *
   * Notifications that come from the client.
   */
  clientNotifications: ClientNotifications;

  /**
   * @alpha
   *
   * Notifications that come from the server.
   */
  serverNotifications: ServerNotifications;

  /**
   * @alpha
   *
   * Requests that come from the client.
   */
  clientRequests: ClientRequests;

  /**
   * @alpha
   *
   * Responses that come from the server.
   */
  serverRequests: ServerRequests;

  /**
   * @alpha
   *
   * Signal emitted when the connection is closed.
   */
  closeSignal: Event<boolean>;

  /**
   * @alpha
   *
   * Signal emitted when the connection receives an error
   * message..
   */
  errorSignal: Event<any>;

  /**
   * @alpha
   *
   * Signal emitted when the connection is initialized.
   */
  serverInitialized: Event<lsp.ServerCapabilities<any>>;

  /**
   * @alpha
   *
   * Send the open request to the backend when the server is
   * ready.
   */
  sendOpenWhenReady(documentInfo: IDocumentInfo): void;

  /**
   * @alpha
   *
   * Send all changes to the server.
   */
  sendFullTextChange(text: string, documentInfo: IDocumentInfo): void;
}
