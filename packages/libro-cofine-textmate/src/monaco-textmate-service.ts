import { EditorHandlerContribution } from '@difizen/libro-cofine-editor-core';
import type { Contribution } from '@difizen/mana-app';
import {
  Disposable,
  DisposableCollection,
  contrib,
  inject,
  singleton,
} from '@difizen/mana-app';
import * as monaco from '@difizen/monaco-editor-core';
import { ILanguageService } from '@difizen/monaco-editor-core/esm/vs/editor/common/languages/language.js';
import { TokenizationRegistry } from '@difizen/monaco-editor-core/esm/vs/editor/common/languages.js';
import { TokenizationSupportAdapter } from '@difizen/monaco-editor-core/esm/vs/editor/standalone/browser/standaloneLanguages.js';
import { StandaloneServices } from '@difizen/monaco-editor-core/esm/vs/editor/standalone/browser/standaloneServices.js';
import { IStandaloneThemeService } from '@difizen/monaco-editor-core/esm/vs/editor/standalone/common/standaloneTheme.js';

import {
  isBasicWasmSupported,
  MonacoGrammarRegistry,
  OnigurumaPromise,
} from './monaco-grammar-registry.js';
import { MonacoThemeRegistry } from './monaco-theme-registry.js';
import {
  getEncodedLanguageId,
  LanguageGrammarDefinitionContribution,
} from './textmate-contribution.js';
import { TextmateRegistry } from './textmate-registry.js';
import type { TokenizerOption } from './textmate-tokenizer.js';
import { createTextmateTokenizer } from './textmate-tokenizer.js';

@singleton({ contrib: EditorHandlerContribution })
export class MonacoTextmateService implements EditorHandlerContribution {
  protected readonly tokenizerOption: TokenizerOption = {
    lineLimit: 400,
  };

  protected readonly _activatedLanguages = new Set<string>();

  @contrib(LanguageGrammarDefinitionContribution)
  protected readonly grammarProviders: Contribution.Provider<LanguageGrammarDefinitionContribution>;

  @inject(TextmateRegistry)
  protected readonly textmateRegistry: TextmateRegistry;
  @inject(MonacoGrammarRegistry)
  protected readonly grammarRegistry: MonacoGrammarRegistry;

  @inject(OnigurumaPromise)
  protected readonly onigasmPromise: OnigurumaPromise;

  @inject(MonacoThemeRegistry)
  protected readonly monacoThemeRegistry: MonacoThemeRegistry;

  beforeCreate() {
    this.initialize();
  }
  afterCreate(
    editor: monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor,
  ) {
    const toDispose = new DisposableCollection(
      Disposable.create(() => {
        /* mark as not disposed */
      }),
    );
    // 激活语言必须在创建编辑器实例后
    const lang = (editor as monaco.editor.IStandaloneCodeEditor)
      .getModel()
      ?.getLanguageId();
    if (lang) {
      this.doActivateLanguage(lang, toDispose);
    }
  }
  canHandle() {
    return true;
  }
  dispose() {
    //
  }

  initialize(): void {
    if (!isBasicWasmSupported) {
      console.warn('Textmate support deactivated because WebAssembly is not detected.');
      return;
    }

    for (const grammarProvider of this.grammarProviders.getContributions()) {
      try {
        grammarProvider.registerTextmateLanguage(this.textmateRegistry);
      } catch (err) {
        console.error(err);
      }
    }
    for (const id of this.textmateRegistry.languages) {
      this.activateLanguage(id);
    }
    // const theme = this.monacoThemeRegistry.getThemeData(this.currentEditorTheme);
    // if (!theme) {
    //   return;
    // }
    // this.grammarRegistry.setupRegistry(theme);
    this.monacoThemeRegistry.onThemeChanged(() => {
      this.updateTheme();
    });
  }

  protected readonly toDisposeOnUpdateTheme = new DisposableCollection();

  protected updateTheme = (): void => {
    this.toDisposeOnUpdateTheme.dispose();

    const { currentEditorTheme } = this;
    document.body.classList.add(currentEditorTheme);
    this.toDisposeOnUpdateTheme.push(
      Disposable.create(() => document.body.classList.remove(currentEditorTheme)),
    );

    // first update registry to run tokenization with the proper theme
    const theme = this.monacoThemeRegistry.getThemeData(currentEditorTheme);
    if (theme) {
      this.grammarRegistry.setupRegistry(theme);
    }

    // then trigger tokenization by setting monaco theme
    monaco.editor.setTheme(currentEditorTheme);
  };

  protected get currentEditorTheme(): string {
    return this.monacoThemeRegistry.getMonacoThemeName();
  }

  activateLanguage(language: string): Disposable {
    const toDispose = new DisposableCollection(
      Disposable.create(() => {
        /* mark as not disposed */
      }),
    );
    toDispose.push(
      this.waitForLanguage(language, () =>
        this.doActivateLanguage(language, toDispose),
      ),
    );
    return toDispose;
  }

  protected async doActivateLanguage(
    languageId: string,
    toDispose: DisposableCollection,
  ): Promise<void> {
    if (this._activatedLanguages.has(languageId)) {
      return;
    }
    this._activatedLanguages.add(languageId);
    toDispose.push(
      Disposable.create(() => this._activatedLanguages.delete(languageId)),
    );

    const scopeName = this.textmateRegistry.getScope(languageId);
    if (!scopeName) {
      return;
    }
    const provider = this.textmateRegistry.getProvider(scopeName);
    if (!provider) {
      return;
    }

    const configuration = this.textmateRegistry.getGrammarConfiguration(languageId);
    const initialLanguage = getEncodedLanguageId(languageId);

    await this.onigasmPromise;
    if (toDispose.disposed) {
      return;
    }
    if (!this.grammarRegistry.registry) {
      return;
    }
    try {
      const grammar = await this.grammarRegistry.registry.loadGrammarWithConfiguration(
        scopeName,
        initialLanguage,
        configuration,
      );
      if (toDispose.disposed) {
        return;
      }
      if (!grammar) {
        throw new Error(
          `no grammar for ${scopeName}, ${initialLanguage}, ${JSON.stringify(
            configuration,
          )}`,
        );
      }
      const options = configuration.tokenizerOption
        ? configuration.tokenizerOption
        : this.tokenizerOption;
      const tokenizer = createTextmateTokenizer(grammar, options);
      toDispose.push(monaco.languages.setTokensProvider(languageId, tokenizer));
      const support = TokenizationRegistry.get(languageId);
      const themeService = StandaloneServices.get(IStandaloneThemeService);
      const adapter = new TokenizationSupportAdapter(
        themeService,
        {
          language: languageId,
          id: StandaloneServices.get(
            ILanguageService,
          )._registry.languageIdCodec._languageToLanguageId.get(languageId),
        },
        tokenizer,
      );
      support!.tokenize = adapter.tokenize.bind(adapter);
      this.updateTheme();
    } catch (error) {
      console.warn('No grammar for this language id', languageId, error);
    }
  }

  protected waitForLanguage(
    language: string,
    cb: () => {
      //
    },
  ): Disposable {
    const modeService = StandaloneServices.get(ILanguageService);
    for (const modeId of Object.keys(modeService._instantiatedModes || {})) {
      const mode = modeService._instantiatedModes[modeId];
      if (mode.getId() === language) {
        cb();
        return Disposable.create(() => {
          //
        });
      }
    }
    // dont work
    // return monaco.editor.onDidCreateEditor((editor) => {
    //   if (editor.getModel()?.getLanguageId() === language) {
    //     cb();
    //   }
    // });

    // triggered on model create, too early if we create model before editor
    return monaco.languages.onLanguage(language, cb);
  }
}
