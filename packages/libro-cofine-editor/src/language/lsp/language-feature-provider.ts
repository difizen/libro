import type { LibroService } from '@difizen/libro-core';
import { EditorCellView } from '@difizen/libro-core';
import type { ILSPDocumentConnectionManager } from '@difizen/libro-lsp';
import type { LSPConnection } from '@difizen/libro-lsp';
import type monaco from '@difizen/monaco-editor-core';
import type * as lsp from 'vscode-languageserver-protocol';

import { LibroE2Editor } from '../../libro-e2-editor.js';

export class LangaugeFeatureProvider {
  protected libroService: LibroService;
  lspDocumentConnectionManager: ILSPDocumentConnectionManager;
  constructor(
    libroService: LibroService,
    lspDocumentConnectionManager: ILSPDocumentConnectionManager,
  ) {
    this.libroService = libroService;
    this.lspDocumentConnectionManager = lspDocumentConnectionManager;
  }

  async getVirtualDocument() {
    const libroView = this.libroService.active;
    if (!libroView) {
      return;
    }
    await this.lspDocumentConnectionManager.ready;
    const adapter = this.lspDocumentConnectionManager.adapters.get(libroView.model.id);
    if (!adapter) {
      throw new Error('no adapter');
    }

    await adapter.ready;

    // Get the associated virtual document of the opened document
    const virtualDocument = adapter.virtualDocument;
    return virtualDocument;
  }

  async getLSPConnection() {
    const virtualDocument = await this.getVirtualDocument();
    if (!virtualDocument) {
      throw new Error('no virtualDocument');
    }

    // Get the LSP connection of the virtual document.
    const lspConnection = this.lspDocumentConnectionManager.connections.get(
      virtualDocument.uri,
    ) as LSPConnection;

    return lspConnection;
  }

  /**
   * find cell editor from active notebook by model uri
   * @param model
   * @returns
   */
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

  protected async getEditorFromLSPPosition(range: lsp.Range) {
    try {
      const virtualDocument = await this.getVirtualDocument();
      const currentEditor = virtualDocument?.getEditorAtVirtualLine({
        line: range.start.line,
        ch: range.start.character,
        isVirtual: true,
      });
      const editor = currentEditor?.getEditor();
      if (editor instanceof LibroE2Editor) {
        return editor;
      }
      return;
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  protected async getProvider(model: monaco.editor.ITextModel) {
    const editor = this.getEditorByModel(model);

    if (!editor) {
      return;
    }

    const provider = await editor.lspProvider?.();
    return provider;
  }
}
