import { DisposableCollection } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';
import * as monaco from '@difizen/monaco-editor-core';

import { EditorHanlerRegistry } from './editor-handler-registry.js';
import type { LazyCallbackType, Options } from './editor-provider.js';
import { MonacoEnvironment } from './monaco-environment.js';
import { ThemeRegistry } from './theme-registry.js';

export const EditorNode = Symbol('EditorNode');
export const MonacoOptions = Symbol('MonacoOptions');
export const LazyCallback = Symbol('LazyCallback');
export const IsDiff = Symbol('IsDiff');
/**
 * E2 Editor
 */

@singleton()
export class E2Editor<
  T extends monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor,
> {
  static createMonacoModel(
    value: string,
    language?: string,
    uri?: monaco.Uri,
  ): monaco.editor.ITextModel {
    return monaco.editor.createModel(value, language, uri);
  }

  static createMonacoEditor(
    node: HTMLElement,
    options: Options,
  ): monaco.editor.IStandaloneCodeEditor {
    return monaco.editor.create(node, options);
  }

  static createMonacoDiffEditor(
    node: HTMLElement,
    options: Options,
  ): monaco.editor.IStandaloneDiffEditor {
    return monaco.editor.createDiffEditor(node, options);
  }
  codeEditor!: T;
  model!: monaco.editor.ITextModel;
  modified!: monaco.editor.ITextModel;
  original!: monaco.editor.ITextModel;
  language?: string;
  protected toDispose: DisposableCollection = new DisposableCollection();
  node: HTMLElement;
  options: Options;
  editorHandlerRegistry: EditorHanlerRegistry;
  themeRegistry: ThemeRegistry;
  isDiff: boolean;
  lazyCallback?: LazyCallbackType;
  constructor(
    @inject(EditorNode) node: HTMLElement,
    @inject(MonacoOptions) options: Options,
    @inject(EditorHanlerRegistry) editorHandlerRegistry: EditorHanlerRegistry,
    @inject(ThemeRegistry) themeRegistry: ThemeRegistry,
    @inject(IsDiff) isDiff: boolean,
    @inject(LazyCallback) lazycallback?: LazyCallbackType,
  ) {
    this.node = node;
    this.options = options;
    this.editorHandlerRegistry = editorHandlerRegistry;
    this.themeRegistry = themeRegistry;
    this.isDiff = isDiff;
    this.lazyCallback = lazycallback;

    if (MonacoEnvironment.lazy) {
      // 资源懒加载场景
      if (!isDiff) {
        this.model =
          options.model ??
          monaco.editor.createModel(options.value || '', options.language, options.uri);
        const language = this.model.getLanguageId();
        (this as E2Editor<monaco.editor.IStandaloneCodeEditor>).codeEditor =
          monaco.editor.create(node, { ...options, model: this.model });
        this.handleEditorLanguageFeatureBefore(language);
        MonacoEnvironment.initModule()
          .then(() => {
            // 设置方言和主题
            const codeEditor = (this as E2Editor<monaco.editor.IStandaloneCodeEditor>)
              .codeEditor;
            // 为了触发onCreate事件
            codeEditor.setModel(
              monaco.editor.createModel(codeEditor.getValue() || '', language),
            );
            this.language = options.language;
            monaco.editor.setTheme(options.theme || '');
            // 调用回调函数
            this.handleEditorLanguageFeatureAfter();
            if (this.lazyCallback) {
              this.lazyCallback(
                (this as E2Editor<monaco.editor.IStandaloneCodeEditor>).codeEditor,
              );
            }
            return;
          })
          .catch(console.error);
      } else {
        this.modified = monaco.editor.createModel(options.modified || '');
        this.original = monaco.editor.createModel(options.original || '');
        (this as E2Editor<monaco.editor.IStandaloneDiffEditor>).codeEditor =
          monaco.editor.createDiffEditor(node, { ...options });
        (this as E2Editor<monaco.editor.IStandaloneDiffEditor>).codeEditor.setModel({
          original: this.original,
          modified: this.modified,
        });
        this.handleEditorLanguageFeatureBefore(options.language);
        MonacoEnvironment.initModule()
          .then(() => {
            monaco.editor.setModelLanguage(this.modified, options.language!);
            monaco.editor.setModelLanguage(this.original, options.language!);
            this.language = this.original.getLanguageId();

            monaco.editor.setTheme(options.theme || '');
            // 调用回调函数
            this.handleEditorLanguageFeatureAfter();
            if (this.lazyCallback) {
              this.lazyCallback(
                (this as E2Editor<monaco.editor.IStandaloneDiffEditor>).codeEditor,
              );
            }
            return;
          })
          .catch(console.error);
      }
    } else {
      // create前钩子函数调用
      this.handleEditorLanguageFeatureBefore(options.language);

      if (!isDiff) {
        this.model =
          options.model ??
          monaco.editor.createModel(options.value || '', options.language, options.uri);
        (this as E2Editor<monaco.editor.IStandaloneCodeEditor>).codeEditor =
          monaco.editor.create(node, { ...options, model: this.model });
        this.toDispose.push(
          this.model.onDidChangeLanguage((e) => {
            this.language = e.newLanguage;
          }),
        );
        this.language = this.model.getLanguageId();
      } else {
        this.modified = monaco.editor.createModel(
          options.modified || '',
          options.language,
        );
        this.original = monaco.editor.createModel(
          options.original || '',
          options.language,
        );
        (this as E2Editor<monaco.editor.IStandaloneDiffEditor>).codeEditor =
          monaco.editor.createDiffEditor(node, { ...options });
        (this as E2Editor<monaco.editor.IStandaloneDiffEditor>).codeEditor.setModel({
          original: this.original,
          modified: this.modified,
        });
        this.toDispose.push(
          this.modified.onDidChangeLanguage((e) => {
            this.language = e.newLanguage;
          }),
        );
        this.language = this.modified.getLanguageId();
      }
      this.handleEditorLanguageFeatureAfter();
    }
  }

  protected handleEditorLanguageFeatureBefore(language: string | undefined) {
    if (language) {
      this.editorHandlerRegistry.handleBefore(language);
    }
  }

  protected handleEditorLanguageFeatureAfter() {
    if (this.language) {
      this.editorHandlerRegistry.handleAfter(this.language, this.codeEditor);
    }
  }
}
