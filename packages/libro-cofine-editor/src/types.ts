import { Range, Uri } from '@difizen/monaco-editor-core';
import type monaco from '@difizen/monaco-editor-core';

export type MonacoEditorType = monaco.editor.IStandaloneCodeEditor;
export type MonacoEditorOptions = monaco.editor.IStandaloneEditorConstructionOptions & {
  uri?: monaco.Uri;
};
export type MonacoMatch = monaco.editor.FindMatch;

export const MonacoRange = Range;
export const MonacoUri = Uri;
