import type monaco from '@difizen/monaco-editor-core';

import type { E2Editor } from './e2-editor.js';
import { EditorProvider } from './editor-provider.js';
import { MonacoEnvironment } from './monaco-environment.js';

export {
  EditorHandlerContribution,
  LanguageOptionsRegistry,
  LanguageWorkerContribution,
  LanguageWorkerRegistry,
} from '@difizen/libro-cofine-editor-contribution';
export type { E2Editor } from './e2-editor.js';
export { EditorHanlerRegistry } from './editor-handler-registry.js';
export { EditorProvider } from './editor-provider.js';
export { InitializeContribution } from './initialize-provider.js';
export { MonacoEnvironment } from './monaco-environment.js';
export { MonacoLoaderConfig } from './monaco-loader.js';
export {
  SnippetSuggestContribution,
  SnippetSuggestRegistry,
} from './snippets-suggest-registry.js';
export {
  MixedThemeRegistry,
  ThemeContribution,
  ThemeRegistry,
} from './theme-registry.js';
export type {
  MixedTheme,
  ITextmateThemeSetting,
  IRawThemeSetting,
  IRawTheme,
} from './theme-registry.js';
export class Editor {
  editor: E2Editor<monaco.editor.IStandaloneCodeEditor>;
  codeEditor: monaco.editor.IStandaloneCodeEditor;
  constructor(
    node: HTMLElement,
    options: monaco.editor.IStandaloneEditorConstructionOptions = {},
  ) {
    const editorProvider =
      MonacoEnvironment.container.get<EditorProvider>(EditorProvider);
    this.editor = editorProvider.create(node, options);
    this.codeEditor = this.editor.codeEditor;
  }
}
