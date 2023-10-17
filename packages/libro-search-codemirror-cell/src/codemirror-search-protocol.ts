import type { CodeMirrorEditor } from '@difizen/libro-codemirror';
import type { LibroCodeCellView } from '@difizen/libro-codemirror-code-cell';

import type { CodeMirrorCodeCellSearchProvider } from './codemirror-code-cell-search-provider.js';
import type { CodeMirrorSearchHighlighter } from './codemirror-search-highlighter.js';

export type CodeMirrorSearchHighlighterFactory = (
  editor: CodeMirrorEditor | undefined,
) => CodeMirrorSearchHighlighter;
export const CodeMirrorSearchHighlighterFactory = Symbol(
  'CodeMirrorSearchHighlighterFactory',
);

export const CodeMirrorCodeCellSearchOption = Symbol('CodeMirrorCodeCellSearchOption');
export interface CodeMirrorCodeCellSearchOption {
  cell: LibroCodeCellView;
}

export const CodeMirrorCodeCellSearchProviderFactory = Symbol(
  'CodeMirrorCodeCellSearchProviderFactory',
);
export type CodeMirrorCodeCellSearchProviderFactory = (
  option: CodeMirrorCodeCellSearchOption,
) => CodeMirrorCodeCellSearchProvider;
