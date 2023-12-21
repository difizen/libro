/* eslint-disable @typescript-eslint/no-parameter-properties */
/* eslint-disable @typescript-eslint/parameter-properties */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-use-before-define */
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import type { Event } from '@difizen/mana-app';
import { Emitter } from '@difizen/mana-app';
import { inject, transient } from '@difizen/mana-app';
import type * as lsp from 'vscode-languageserver-protocol';
import type { MessageConnection } from 'vscode-ws-jsonrpc';

import type { AnyMethodType, IMessageLog } from './lsp-protocol.js';
import { MessageKind } from './lsp-protocol.js';
import { LSPMonitor } from './monitor.js';
import { Method, ILSPOptions } from './tokens.js';
import type {
  ClientNotifications,
  ClientRequests,
  IClientRequestHandler,
  IClientRequestParams,
  IClientResult,
  IDocumentInfo,
  ILSPConnection,
  IServerRequestHandler,
  IServerRequestParams,
  IServerResult,
  ServerNotifications,
  ServerRequests,
} from './tokens.js';
import { untilReady } from './utils.js';
import {
  registerServerCapability,
  unregisterServerCapability,
} from './ws-connection/server-capability-registration.js';
import { LspWsConnection } from './ws-connection/ws-connection.js';

/**
 * Helper class to handle client request
 */
class ClientRequestHandler<
  T extends keyof IClientRequestParams = keyof IClientRequestParams,
> implements IClientRequestHandler
{
  constructor(
    protected connection: MessageConnection,
    protected method: T,
    protected emitter: LSPConnection,
  ) {}
  request(params: IClientRequestParams[T]): Promise<IClientResult[T]> {
    // TODO check if is ready?
    this.emitter.log(MessageKind.clientRequested, {
      method: this.method,
      message: params,
    });
    return this.connection
      .sendRequest<any>(this.method, params)
      .then((result: IClientResult[T]) => {
        this.emitter.log(MessageKind.resultForClient, {
          method: this.method,
          message: params,
        });
        return result;
      });
  }
}

/**
 * Helper class to handle server responses
 */
class ServerRequestHandler<
  T extends keyof IServerRequestParams = keyof IServerRequestParams,
> implements IServerRequestHandler
{
  constructor(
    protected connection: MessageConnection,
    protected method: T,
    protected emitter: LSPConnection,
  ) {
    // on request accepts "thenable"
    this.connection.onRequest(method, this._handle.bind(this));
    this._handler = null;
  }

  setHandler(
    handler: (
      params: IServerRequestParams[T],
      connection?: LSPConnection,
    ) => Promise<IServerResult[T]>,
  ) {
    this._handler = handler;
  }

  clearHandler() {
    this._handler = null;
  }

  protected _handler:
    | ((
        params: IServerRequestParams[T],
        connection?: LSPConnection,
      ) => Promise<IServerResult[T]>)
    | null;

  protected _handle(
    request: IServerRequestParams[T],
  ): Promise<IServerResult[T] | undefined> {
    this.emitter.log(MessageKind.serverRequested, {
      method: this.method,
      message: request,
    });
    if (!this._handler) {
      return new Promise(() => undefined);
    }
    return this._handler(request, this.emitter).then((result) => {
      this.emitter.log(MessageKind.responseForServer, {
        method: this.method,
        message: result,
      });
      return result;
    });
  }
}

export const Provider: Record<string, keyof lsp.ServerCapabilities> = {
  TEXT_DOCUMENT_SYNC: 'textDocumentSync',
  COMPLETION: 'completionProvider',
  HOVER: 'hoverProvider',
  SIGNATURE_HELP: 'signatureHelpProvider',
  DECLARATION: 'declarationProvider',
  DEFINITION: 'definitionProvider',
  TYPE_DEFINITION: 'typeDefinitionProvider',
  IMPLEMENTATION: 'implementationProvider',
  REFERENCES: 'referencesProvider',
  DOCUMENT_HIGHLIGHT: 'documentHighlightProvider',
  DOCUMENT_SYMBOL: 'documentSymbolProvider',
  CODE_ACTION: 'codeActionProvider',
  CODE_LENS: 'codeLensProvider',
  DOCUMENT_LINK: 'documentLinkProvider',
  COLOR: 'colorProvider',
  DOCUMENT_FORMATTING: 'documentFormattingProvider',
  DOCUMENT_RANGE_FORMATTING: 'documentRangeFormattingProvider',
  DOCUMENT_ON_TYPE_FORMATTING: 'documentOnTypeFormattingProvider',
  RENAME: 'renameProvider',
  FOLDING_RANGE: 'foldingRangeProvider',
  EXECUTE_COMMAND: 'executeCommandProvider',
  SELECTION_RANGE: 'selectionRangeProvider',
  WORKSPACE_SYMBOL: 'workspaceSymbolProvider',
  WORKSPACE: 'workspace',
};

/**
 * Create a map between the request method and its handler
 */
function createMethodMap<T, H, U extends keyof T = keyof T>(
  methods: AnyMethodType,
  handlerFactory: (method: U) => H,
): T {
  const result: { [key in U]?: H } = {};
  for (const method of Object.values(methods)) {
    result[method as U] = handlerFactory(method as U);
  }
  return result as T;
}

export const LSPConnectionFactory = Symbol('LSPConnectionFactory');
export type LSPConnectionFactory = (options: ILSPOptions) => LSPConnection;

@transient()
export class LSPConnection extends LspWsConnection implements ILSPConnection {
  @inject(LSPMonitor) lspmonitor: LSPMonitor;
  constructor(@inject(ILSPOptions) options: ILSPOptions) {
    super(options);
    this._options = options;
    this.logAllCommunication = false;
    this.serverIdentifier = options.serverIdentifier;
    this.serverLanguage = options.languageId;
    this.documentsToOpen = [];
    this.clientNotifications = this.constructNotificationHandlers<ClientNotifications>(
      Method.ClientNotification,
    );
    this.serverNotifications = this.constructNotificationHandlers<ServerNotifications>(
      Method.ServerNotification,
    );
  }

  /**
   * Identifier of the language server
   */
  readonly serverIdentifier?: string;

  /**
   * Language of the language server
   */
  readonly serverLanguage?: string;

  /**
   * Notifications comes from the client.
   */
  readonly clientNotifications: ClientNotifications;

  /**
   * Notifications comes from the server.
   */
  readonly serverNotifications: ServerNotifications;

  /**
   * Requests comes from the client.
   */
  clientRequests: ClientRequests;

  /**
   * Responses comes from the server.
   */
  serverRequests: ServerRequests;

  /**
   * Should log all communication?
   */
  logAllCommunication: boolean;

  get capabilities() {
    return this.serverCapabilities;
  }

  /**
   * Signal emitted when the connection is closed.
   */
  get closeSignal(): Event<boolean> {
    return this._closeSignal.event;
  }

  /**
   * Signal emitted when the connection receives an error
   * message..
   */
  get errorSignal(): Event<any> {
    return this._errorSignal.event;
  }

  /**
   * Signal emitted when the connection is initialized.
   */
  get serverInitialized(): Event<lsp.ServerCapabilities<any>> {
    return this._serverInitialized.event;
  }

  /**
   * Dispose the connection.
   */
  override dispose(): void {
    if (this.isDisposed) {
      return;
    }
    Object.values(this.serverRequests).forEach((request) => request.clearHandler());
    this.close();
    super.dispose();
  }

  /**
   * Helper to print the logs to logger, for now we are using
   * directly the browser's console.
   */
  log(kind: MessageKind, message: IMessageLog): void {
    if (this.logAllCommunication) {
      // eslint-disable-next-line no-console
      console.log(kind, message);
    }
    this.lspmonitor.log({
      serverIdentifier: this.serverIdentifier ?? '',
      serverLanguage: this.serverLanguage ?? '',
      kind,
      message,
    });
  }

  /**
   * Send the open request to the backend when the server is
   * ready.
   */
  sendOpenWhenReady(documentInfo: IDocumentInfo): void {
    if (this.isReady) {
      this.sendOpen(documentInfo);
    } else {
      this.documentsToOpen.push(documentInfo);
    }
  }

  /**
   * Send the document changes to the server.
   */
  sendSelectiveChange(
    changeEvent: lsp.TextDocumentContentChangeEvent,
    documentInfo: IDocumentInfo,
  ): void {
    this._sendChange([changeEvent], documentInfo);
  }

  /**
   * Send all changes to the server.
   */
  sendFullTextChange(text: string, documentInfo: IDocumentInfo): void {
    this._sendChange([{ text }], documentInfo);
  }

  /**
   * Check if a provider is available in the registered capabilities.
   */
  provides(provider: keyof lsp.ServerCapabilities): boolean {
    return !!(this.serverCapabilities && this.serverCapabilities[provider]);
  }

  /**
   * Close the connection to the server.
   */
  override close(): void {
    try {
      this._closingManually = true;
      super.close();
    } catch (e) {
      this._closingManually = false;
    }
  }

  /**
   * initialize a connection over a web socket that speaks the LSP
   */
  override connect(socket: WebSocket): void {
    super.connect(socket);
    untilReady(() => {
      return this.isConnected;
    }, -1)
      .then(() => {
        const disposable = this.connection.onClose(() => {
          this._isConnected = false;
          this._closeSignal.fire(this._closingManually);
        });
        this._disposables.push(disposable);
        return;
      })
      .catch(() => {
        console.error('Could not connect onClose signal');
      });
  }

  /**
   * Get send request to the server to get completion results
   * from a completion item
   */
  async getCompletionResolve(
    completionItem: lsp.CompletionItem,
  ): Promise<lsp.CompletionItem | undefined> {
    if (!this.isReady) {
      return;
    }
    return this.connection.sendRequest<lsp.CompletionItem>(
      'completionItem/resolve',
      completionItem,
    );
  }

  /**
   * List of documents waiting to be opened once the connection
   * is ready.
   */
  protected documentsToOpen: IDocumentInfo[];

  /**
   * Generate the notification handlers
   */
  protected constructNotificationHandlers<
    T extends ServerNotifications | ClientNotifications,
  >(methods: typeof Method.ServerNotification | typeof Method.ClientNotification): T {
    const factory = () => new Emitter<any>();
    return createMethodMap<T, Emitter<any>>(methods, factory);
  }

  /**
   * Generate the client request handler
   */
  protected constructClientRequestHandler<
    T extends ClientRequests,
    U extends keyof T = keyof T,
  >(methods: typeof Method.ClientRequest): T {
    return createMethodMap<T, IClientRequestHandler>(
      methods,
      (method) => new ClientRequestHandler(this.connection, method as U as any, this),
    );
  }

  /**
   * Generate the server response handler
   */
  protected constructServerRequestHandler<
    T extends ServerRequests,
    U extends keyof T = keyof T,
  >(methods: typeof Method.ServerRequest): T {
    return createMethodMap<T, IServerRequestHandler>(
      methods,
      (method) => new ServerRequestHandler(this.connection, method as U as any, this),
    );
  }

  /**
   * Initialization parameters to be sent to the language server.
   * Subclasses can overload this when adding more features.
   */
  protected override initializeParams(): lsp.InitializeParams {
    return {
      ...super.initializeParams(),
      capabilities: this._options.capabilities,
      initializationOptions: null,
      processId: null,
      workspaceFolders: null,
    };
  }

  /**
   * Callback called when the server is initialized.
   */
  protected override onServerInitialized(params: lsp.InitializeResult): void {
    this.afterInitialized();
    super.onServerInitialized(params);
    while (this.documentsToOpen.length) {
      this.sendOpen(this.documentsToOpen.pop()!);
    }
    this._serverInitialized.fire(this.serverCapabilities);
  }

  /**
   * Once the server is initialized, this method generates the
   * client and server handlers
   */
  protected afterInitialized(): void {
    const disposable = this.connection.onError((e) => this._errorSignal.fire(e));
    this._disposables.push(disposable);
    for (const method of Object.values(
      Method.ServerNotification,
    ) as (keyof ServerNotifications)[]) {
      const signal = this.serverNotifications[method] as Emitter<any>;
      const disposable = this.connection.onNotification(method, (params) => {
        this.log(MessageKind.serverNotifiedClient, {
          method,
          message: params,
        });
        signal.fire(params);
      });
      this._disposables.push(disposable);
    }

    for (const method of Object.values(
      Method.ClientNotification,
    ) as (keyof ClientNotifications)[]) {
      const signal = this.clientNotifications[method] as Emitter<any>;
      signal.event((params) => {
        this.log(MessageKind.clientNotifiedServer, {
          method,
          message: params,
        });
        this.connection.sendNotification(method, params).catch(console.error);
      });
    }

    this.clientRequests = this.constructClientRequestHandler<ClientRequests>(
      Method.ClientRequest,
    );
    this.serverRequests = this.constructServerRequestHandler<ServerRequests>(
      Method.ServerRequest,
    );

    this.serverRequests['client/registerCapability'].setHandler(
      async (params: lsp.RegistrationParams) => {
        params.registrations.forEach((capabilityRegistration: lsp.Registration) => {
          try {
            const updatedCapabilities = registerServerCapability(
              this.serverCapabilities,
              capabilityRegistration,
            );
            if (updatedCapabilities === null) {
              console.error(
                `Failed to register server capability: ${capabilityRegistration}`,
              );
              return;
            }
            this.serverCapabilities = updatedCapabilities;
          } catch (err) {
            console.error(err);
          }
        });
      },
    );

    this.serverRequests['client/unregisterCapability'].setHandler(
      async (params: lsp.UnregistrationParams) => {
        params.unregisterations.forEach(
          (capabilityUnregistration: lsp.Unregistration) => {
            this.serverCapabilities = unregisterServerCapability(
              this.serverCapabilities,
              capabilityUnregistration,
            );
          },
        );
      },
    );

    this.serverRequests['workspace/configuration'].setHandler(async (params) => {
      return params.items.map((item) => {
        // LSP: "If the client can’t provide a configuration setting for a given scope
        // then `null` needs to be present in the returned array."

        // for now we do not support configuration, but yaml server does not respect
        // client capability so we have a handler just for that
        return null;
      });
    });
  }

  /**
   * Is the connection is closed manually?
   */
  protected _closingManually = false;

  protected _options: ILSPOptions;

  protected _closeSignal = new Emitter<boolean>();
  protected _errorSignal = new Emitter<any>();
  protected _serverInitialized = new Emitter<lsp.ServerCapabilities<any>>();

  /**
   * Send the document changed data to the server.
   */
  protected _sendChange(
    changeEvents: lsp.TextDocumentContentChangeEvent[],
    documentInfo: IDocumentInfo,
  ) {
    if (!this.isReady) {
      return;
    }
    if (documentInfo.uri.length === 0) {
      return;
    }
    if (!this.openedUris.get(documentInfo.uri)) {
      this.sendOpen(documentInfo);
    }
    const textDocumentChange: lsp.DidChangeTextDocumentParams = {
      textDocument: {
        uri: documentInfo.uri,
        version: documentInfo.version,
      } as lsp.VersionedTextDocumentIdentifier,
      contentChanges: changeEvents,
    };
    this.connection
      .sendNotification('textDocument/didChange', textDocumentChange)
      .catch(console.error);
    documentInfo.version++;
  }
}
