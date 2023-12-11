import type { LibroCodeCellView } from '@difizen/libro-code-cell';
import type { IEditor, SearchMatch } from '@difizen/libro-code-editor';
import type { CellSearchProvider } from '@difizen/libro-search';

export type CodeEditorSearchHighlighterFactory = (
  editor: IEditor | undefined,
) => CodeEditorSearchHighlighter;
export const CodeEditorSearchHighlighterFactory = Symbol(
  'CodeEditorSearchHighlighterFactory',
);

export const CodeCellSearchOption = Symbol('CodeCellSearchOption');
export interface CodeCellSearchOption {
  cell: LibroCodeCellView;
}

export const CodeCellSearchProviderFactory = Symbol('CodeCellSearchProviderFactory');
export type CodeCellSearchProviderFactory = (
  option: CodeCellSearchOption,
) => CellSearchProvider;

export interface CodeEditorSearchHighlighter {
  /**
   * The list of matches
   */
  get matches(): SearchMatch[];
  set matches(v: SearchMatch[]);

  get currentIndex(): number | undefined;
  set currentIndex(v: number | undefined);

  setEditor: (editor: IEditor) => void;

  clearHighlight: () => void;

  endQuery: () => Promise<void>;

  highlightNext: () => Promise<SearchMatch | undefined>;
  highlightPrevious: () => Promise<SearchMatch | undefined>;
}
