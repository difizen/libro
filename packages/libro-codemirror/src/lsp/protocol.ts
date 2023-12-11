import type { Extension } from '@codemirror/state';
import type { LSPProvider } from '@difizen/libro-lsp';

export interface LSPExtensionOptions {
  lspProvider?: LSPProvider;
}

export type CMLSPExtension = (option: LSPExtensionOptions) => Extension;
