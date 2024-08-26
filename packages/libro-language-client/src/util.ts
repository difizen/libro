import type { IPosition, IRange } from '@difizen/libro-code-editor';
import type * as monaco from '@difizen/monaco-editor-core';

export const toEditorRange = (range: monaco.IRange): IRange => {
  return {
    start: {
      line: range.startLineNumber - 1,
      column: range.startColumn - 1,
    },
    end: {
      line: range.endLineNumber - 1,
      column: range.endColumn - 1,
    },
  };
};

export const toMonacoPosition = (position: monaco.IPosition | undefined): IPosition => {
  if (!position) {
    return {
      column: 0,
      line: 0,
    };
  }
  return {
    column: position?.column - 1,
    line: position?.lineNumber - 1,
  };
};
