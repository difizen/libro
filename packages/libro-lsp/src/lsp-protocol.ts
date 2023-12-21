import type { LSPConnection } from './connection.js';
import type { Document } from './tokens.js';
import type { Method } from './tokens.js';
import type { VirtualDocument } from './virtual/document.js';

export type LSPProviderResult = {
  virtualDocument: VirtualDocument;
  lspConnection: LSPConnection;
  editor: Document.IEditor;
};
export type LSPProvider = () => Promise<LSPProviderResult>;

export type AnyMethodType =
  | typeof Method.ServerNotification
  | typeof Method.ClientNotification
  | typeof Method.ClientRequest
  | typeof Method.ServerRequest;
export type AnyMethod =
  | Method.ServerNotification
  | Method.ClientNotification
  | Method.ClientRequest
  | Method.ServerRequest;

export enum MessageKind {
  clientNotifiedServer = 'clientNotifiedServer',
  serverNotifiedClient = 'serverNotifiedClient',
  serverRequested = 'serverRequested',
  clientRequested = 'clientRequested',
  resultForClient = 'resultForClient',
  responseForServer = 'responseForServer',
}

export interface IMessageLog<T extends AnyMethod = AnyMethod> {
  method: T;
  message: any;
}
