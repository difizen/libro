import {
  EditorHandlerContribution,
  LanguageOptionsRegistry,
} from '@difizen/libro-cofine-editor-core';
import { LibroService } from '@difizen/libro-core';
import type { LSPConnection } from '@difizen/libro-lsp';
import { ILSPDocumentConnectionManager } from '@difizen/libro-lsp';
import { Disposable, DisposableCollection, inject, singleton } from '@difizen/mana-app';
import * as monaco from '@difizen/monaco-editor-core';

import { LibroE2URIScheme } from '../../libro-e2-editor.js';

import { CompletionProvider } from './completion-provider.js';
import { DiagnosticProvider } from './diagnostic-provider.js';
import { HoverProvider } from './hover-provider.js';
import { SignatureHelpProvider } from './signature-help-provider.js';

@singleton({
  contrib: [EditorHandlerContribution],
})
export class LSPContribution implements EditorHandlerContribution {
  @inject(LanguageOptionsRegistry)
  protected readonly optionsResgistry: LanguageOptionsRegistry;

  @inject(LibroService) protected readonly libroService: LibroService;

  @inject(ILSPDocumentConnectionManager)
  protected readonly lspDocumentConnectionManager: ILSPDocumentConnectionManager;

  protected toDispose = new DisposableCollection();

  protected lspLangs = ['python'];

  beforeCreate() {
    //
  }
  afterCreate(editor: any) {
    this.registerLSPFeature(editor as monaco.editor.IStandaloneCodeEditor);
  }
  canHandle(language: string) {
    return this.lspLangs.includes(language);
  }

  getLanguageSelector(
    model: monaco.editor.ITextModel,
  ): monaco.languages.LanguageFilter {
    return {
      scheme: LibroE2URIScheme,
      pattern: model.uri.path,
    };
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

  registerLSPFeature(editor: monaco.editor.IStandaloneCodeEditor) {
    const model = editor.getModel();
    if (!model) {
      return;
    }

    Promise.all([this.getVirtualDocument(), this.getLSPConnection()])
      .then(([virtualDocument, lspConnection]) => {
        if (!lspConnection || !virtualDocument) {
          return;
        }
        this.toDispose.push(
          monaco.languages.registerCompletionItemProvider(
            this.getLanguageSelector(model),
            new CompletionProvider(this.libroService, lspConnection, virtualDocument),
          ),
        );

        this.toDispose.push(
          monaco.languages.registerHoverProvider(
            this.getLanguageSelector(model),
            new HoverProvider(this.libroService, lspConnection, virtualDocument),
          ),
        );

        const provider = new DiagnosticProvider(
          this.libroService,
          lspConnection,
          virtualDocument,
        );
        this.toDispose.push(Disposable.create(() => provider.dispose()));

        this.toDispose.push(
          monaco.languages.registerSignatureHelpProvider(
            this.getLanguageSelector(model),
            new SignatureHelpProvider(
              this.libroService,
              lspConnection,
              virtualDocument,
            ),
          ),
        );
        // const formatProvider = new FormatProvider(
        //   this.libroService,
        //   lspConnection,
        //   virtualDocument,
        // );
        // monaco.languages.registerDocumentFormattingEditProvider(
        //   this.getLanguageSelector(model),
        //   formatProvider,
        // );
        // monaco.languages.registerDocumentRangeFormattingEditProvider(
        //   this.getLanguageSelector(model),
        //   formatProvider,
        // );
        return;
      })
      .catch(console.error);

    // // SignatureHelp
    // monaco.languages.registerSignatureHelpProvider(id, new SignatureHelpProvider(this._worker));

    // // 定义跳转;
    // monaco.languages.registerDefinitionProvider(id, new DefinitionAdapter(this._worker));
  }

  protected isDisposed = false;

  get disposed() {
    return this.isDisposed;
  }

  disposeLanguageFeature() {
    this.toDispose.dispose();
  }

  dispose() {
    this.disposeLanguageFeature();
    this.isDisposed = false;
  }
}
