import type monaco from '@difizen/monaco-editor-core';

import type { E2Editor } from './e2-editor.js';

export const EditorProvider = Symbol('EditorProvider');
export type Options = monaco.editor.IStandaloneEditorConstructionOptions &
  monaco.editor.IDiffEditorConstructionOptions & {
    modified?: string;
    original?: string;
  } & {
    uri?: monaco.Uri;
  };

export interface EditorProvider {
  create: (
    node: HTMLElement,
    options: Options,
    callback?: LazyCallbackType,
  ) => E2Editor<monaco.editor.IStandaloneCodeEditor>;
  createDiff: (
    node: HTMLElement,
    options: Options,
    callback?: LazyCallbackType,
  ) => E2Editor<monaco.editor.IStandaloneDiffEditor>;
}

export type LazyCallbackType = (
  editor: monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor,
) => void;
