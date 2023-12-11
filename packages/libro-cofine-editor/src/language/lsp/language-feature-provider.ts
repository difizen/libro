import type { LibroService } from '@difizen/libro-core';
import { EditorCellView } from '@difizen/libro-core';
import type { LSPProviderResult } from '@difizen/libro-lsp';
import type { LSPConnection, VirtualDocument } from '@difizen/libro-lsp';
import type monaco from '@difizen/monaco-editor-core';
import type * as lsp from 'vscode-languageserver-protocol';

import { LibroE2Editor } from '../../libro-e2-editor.js';

export class LangaugeFeatureProvider {
  protected libroService: LibroService;
  protected lspProvider?: LSPProviderResult;
  protected lspConnection: LSPConnection;
  virtualDocument: VirtualDocument;
  constructor(
    libroService: LibroService,
    lspConnection: LSPConnection,
    virtualDocument: VirtualDocument,
  ) {
    this.libroService = libroService;
    this.lspConnection = lspConnection;
    this.virtualDocument = virtualDocument;
  }

  protected getEditorByModel(model: monaco.editor.ITextModel) {
    const cells = this.libroService.active?.model.cells;
    if (!cells) {
      return;
    }
    const cell = cells.find((item) => {
      const editorUuid = model.uri.path.split('.')[0];
      if (!EditorCellView.is(item)) {
        return false;
      }
      const e2editor = item.editor;
      if (!(e2editor instanceof LibroE2Editor)) {
        return false;
      }
      return editorUuid === e2editor.uuid;
    });

    return (cell as EditorCellView).editor as LibroE2Editor | undefined;
  }

  protected getEditorFromLSPPosition(range: lsp.Range) {
    const currentEditor = this.virtualDocument.getEditorAtVirtualLine({
      line: range.start.line,
      ch: range.start.character,
      isVirtual: true,
    });
    const editor = currentEditor.getEditor();
    if (editor instanceof LibroE2Editor) {
      return editor;
    }
    return;
  }

  protected async getProvider(model: monaco.editor.ITextModel) {
    const editor = this.getEditorByModel(model);

    if (!editor) {
      return;
    }

    const provider = await editor.lspProvider?.();
    this.lspProvider = provider;
    return provider;
  }
}
