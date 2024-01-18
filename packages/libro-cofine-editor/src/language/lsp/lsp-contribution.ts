import { EditorHandlerContribution } from '@difizen/libro-cofine-editor-core';
import { LibroService } from '@difizen/libro-core';
import { ILSPDocumentConnectionManager } from '@difizen/libro-lsp';
import { Disposable, DisposableCollection, inject, singleton } from '@difizen/mana-app';
import type { editor } from '@difizen/monaco-editor-core';
import { languages } from '@difizen/monaco-editor-core';
// import { ILanguageFeaturesService } from '@difizen/monaco-editor-core/esm/vs/editor/common/services/languageFeatures.js';
// import { StandaloneServices } from '@difizen/monaco-editor-core/esm/vs/editor/standalone/browser/standaloneServices.js';
// import { getSingletonServiceDescriptors } from '@difizen/monaco-editor-core/esm/vs/platform/instantiation/common/extensions.js';

import { LibroE2URIScheme } from '../../libro-e2-editor.js';

import { CompletionProvider } from './completion-provider.js';
import { DiagnosticProvider } from './diagnostic-provider.js';
import { HoverProvider } from './hover-provider.js';
import { SignatureHelpProvider } from './signature-help-provider.js';

@singleton({
  contrib: [EditorHandlerContribution],
})
export class LSPContribution implements EditorHandlerContribution {
  @inject(LibroService) protected readonly libroService: LibroService;

  @inject(ILSPDocumentConnectionManager)
  protected readonly lspDocumentConnectionManager: ILSPDocumentConnectionManager;

  protected toDispose = new DisposableCollection();

  protected lspLangs = ['python'];

  beforeCreate() {
    //
  }
  afterCreate(editor: any) {
    this.registerLSPFeature(editor as editor.IStandaloneCodeEditor);
    // const languageFeaturesService = getOrigin(StandaloneServices).get(
    //   ILanguageFeaturesService,
    // );
    // for (const [id, descriptor] of getSingletonServiceDescriptors()) {
    //   if (id === ILanguageFeaturesService) {
    //     console.log('lll', descriptor);
    //   }
    // }
    // console.log(
    //   StandaloneServices,
    //   StandaloneServices.initialize(),
    //   getOrigin(languageFeaturesService),
    // );
  }
  canHandle(language: string) {
    return this.lspLangs.includes(language);
  }

  getLanguageSelector(model: editor.ITextModel): languages.LanguageFilter {
    return {
      scheme: LibroE2URIScheme,
      pattern: model.uri.path,
    };
  }

  registerLSPFeature(editor: editor.IStandaloneCodeEditor) {
    const model = editor.getModel();
    if (!model) {
      return;
    }

    this.toDispose.push(
      languages.registerCompletionItemProvider(
        this.getLanguageSelector(model),
        new CompletionProvider(this.libroService, this.lspDocumentConnectionManager),
      ),
    );

    this.toDispose.push(
      languages.registerHoverProvider(
        this.getLanguageSelector(model),
        new HoverProvider(this.libroService, this.lspDocumentConnectionManager),
      ),
    );

    const provider = new DiagnosticProvider(
      this.libroService,
      this.lspDocumentConnectionManager,
    );
    this.toDispose.push(Disposable.create(() => provider.dispose()));

    this.toDispose.push(
      languages.registerSignatureHelpProvider(
        this.getLanguageSelector(model),
        new SignatureHelpProvider(this.libroService, this.lspDocumentConnectionManager),
      ),
    );
    // const formatProvider = new FormatProvider(
    //   this.libroService,
    //   lspConnection,
    //   virtualDocument,
    // );
    // languages.registerDocumentFormattingEditProvider(
    //   this.getLanguageSelector(model),
    //   formatProvider,
    // );
    // languages.registerDocumentRangeFormattingEditProvider(
    //   this.getLanguageSelector(model),
    //   formatProvider,
    // );
    return;

    // // SignatureHelp
    // languages.registerSignatureHelpProvider(id, new SignatureHelpProvider(this._worker));

    // // 定义跳转;
    // languages.registerDefinitionProvider(id, new DefinitionAdapter(this._worker));
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
