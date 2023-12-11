import type { LSPConnection } from './connection.js';
import type { Document } from './tokens.js';
import type { VirtualDocument } from './virtual/document.js';

export type LSPProviderResult = {
  virtualDocument: VirtualDocument;
  lspConnection: LSPConnection;
  editor: Document.IEditor;
};
export type LSPProvider = () => Promise<LSPProviderResult>;
