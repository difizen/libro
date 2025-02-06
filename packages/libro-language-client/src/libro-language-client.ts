import { Deferred } from '@difizen/libro-common/mana-common';
import {
  BrowserMessageReader,
  BrowserMessageWriter,
} from '@difizen/vscode-languageserver-protocol/browser.js';
import {
  WebSocketMessageReader,
  WebSocketMessageWriter,
  toSocket,
} from 'vscode-ws-jsonrpc';

import type { LanguageClientOptions, MessageTransports } from './common/client.js';
import { BaseLanguageClient } from './common/client.js';

export interface IConnectionProvider {
  get(encoding: string): Promise<MessageTransports>;
}

export interface LibroLanguageClientOptions {
  name: string;
  id?: string;
  clientOptions: LanguageClientOptions;
}

export interface LibroLanguageClientFullOptions extends LibroLanguageClientOptions {
  connectionProvider: IConnectionProvider;
}

export class LibroLanguageClient extends BaseLanguageClient {
  static createWebSocketLanguageClient = async (
    url: string,
    options: LibroLanguageClientOptions,
  ) => {
    const deferred = new Deferred<{
      connection: WebSocket;
      languageClient: LibroLanguageClient;
    }>();
    const webSocket = new WebSocket(url);
    webSocket.onopen = async () => {
      const socket = toSocket(webSocket);
      const reader = new WebSocketMessageReader(socket);
      const writer = new WebSocketMessageWriter(socket);
      const connectionProvider = {
        get: () => {
          return Promise.resolve({ reader, writer });
        },
      };
      const languageClient = new LibroLanguageClient({
        ...options,
        connectionProvider,
      });
      await languageClient.start();
      reader.onClose(() => languageClient.stop());
      deferred.resolve({
        connection: webSocket,
        languageClient,
      });
    };
    return deferred.promise;
  };

  static createWebWorkerLanguageClient = async (
    url: string,
    options: LibroLanguageClientOptions,
  ): Promise<{ connection: Worker; languageClient: LibroLanguageClient }> => {
    const worker = new Worker(url);
    const reader = new BrowserMessageReader(worker);
    const writer = new BrowserMessageWriter(worker);
    const connectionProvider = {
      get: () => {
        return Promise.resolve({ reader, writer });
      },
    };
    const languageClient = new LibroLanguageClient({
      ...options,
      connectionProvider,
    });
    await languageClient.start();
    reader.onClose(() => languageClient.stop());
    return { connection: worker, languageClient };
  };

  protected readonly connectionProvider: IConnectionProvider;

  constructor({
    id,
    name,
    clientOptions,
    connectionProvider,
  }: LibroLanguageClientFullOptions) {
    super(id || name.toLowerCase(), name, clientOptions);
    this.connectionProvider = connectionProvider;
  }

  protected override createMessageTransports(
    encoding: string,
  ): Promise<MessageTransports> {
    return this.connectionProvider.get(encoding);
  }
}
