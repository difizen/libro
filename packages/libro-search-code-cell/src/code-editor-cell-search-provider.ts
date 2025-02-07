import type { LibroCodeCellView } from '@difizen/libro-code-cell';
import type { IPosition, SearchMatch } from '@difizen/libro-code-editor';
import type { BaseSearchProvider, SearchFilters } from '@difizen/libro-search';
import { searchText } from '@difizen/libro-search';
import type { Event } from '@difizen/libro-common/app';
import { Disposable } from '@difizen/libro-common/app';
import { prop } from '@difizen/libro-common/app';
import { DisposableCollection, Emitter } from '@difizen/libro-common/app';
import { watch } from '@difizen/libro-common/app';
import { inject, transient } from '@difizen/libro-common/app';

import type { CodeEditorSearchHighlighter } from './code-cell-search-protocol.js';
import { CodeEditorSearchHighlighterFactory } from './code-cell-search-protocol.js';
/**
 * Search provider for cells.
 */
@transient()
export class CodeEditorCellSearchProvider implements BaseSearchProvider {
  protected toDispose = new DisposableCollection();
  /**
   * code editor search highlighter
   */
  @prop() protected editorHighlighter: CodeEditorSearchHighlighter;
  /**
   * Current match index
   */
  @prop() protected currentIndex: number | undefined = undefined;
  /**
   * Current search filters
   */
  @prop() protected filters: SearchFilters | undefined;
  /**
   * Current search query
   */
  protected query: RegExp | null = null;
  // Needs to be protected so subclass can emit the signal too.
  protected stateChangedEmitter: Emitter<void>;
  protected _isActive = true;
  protected _isDisposed = false;
  protected lastReplacementPosition: IPosition | null = null;
  protected highlighterFactory: CodeEditorSearchHighlighterFactory;
  protected cell: LibroCodeCellView;
  /**
   * Constructor
   *
   * @param cell Cell widget
   */
  constructor(
    @inject(CodeEditorSearchHighlighterFactory)
    highlighterFactory: CodeEditorSearchHighlighterFactory,
    cell: LibroCodeCellView,
  ) {
    this.cell = cell;
    this.highlighterFactory = highlighterFactory;
    this.currentIndex = undefined;
    this.stateChangedEmitter = new Emitter<void>();
    this.toDispose.push(this.stateChangedEmitter);
    this.editorHighlighter = this.highlighterFactory(this.cell.editor);

    this.toDispose.push(watch(this.cell.model, 'value', this.updateMatches));
    this.toDispose.push(
      this.cell.editorView?.onEditorStatusChange((e) => {
        if (e.status === 'ready') {
          const editor = this.cell.editorView?.editor;
          if (editor) {
            this.editorHighlighter.setEditor(editor);
          }
          if (e.prevState === 'init') {
            if (this.cell.hasInputHidden === true) {
              this.endQuery();
            } else {
              this.startQuery(this.query, this.filters);
            }
          }
        }
      }) ?? Disposable.NONE,
    );
  }

  /**
   * Get an initial query value if applicable so that it can be entered
   * into the search box as an initial query
   *
   * @returns Initial value used to populate the search box.
   */
  getInitialQuery(): string {
    const selection = this.cell?.editor?.getSelectionValue();
    // if there are newlines, just return empty string
    return selection?.search(/\r?\n|\r/g) === -1 ? selection : '';
  }

  get disposed() {
    return this._isDisposed;
  }

  protected async setEditor() {
    if (this.cell.editor && this.cell.editorView?.editorStatus === 'ready') {
      this.editorHighlighter.setEditor(this.cell.editor);
    }
  }

  /**
   * Changed signal to be emitted when search matches change.
   */
  get stateChanged(): Event<void> {
    return this.stateChangedEmitter.event;
  }

  /**
   * Current match index
   */
  get currentMatchIndex(): number | undefined {
    return this.isActive ? this.currentIndex : undefined;
  }

  /**
   * Whether the cell search is active.
   *
   * This is used when applying search only on selected cells.
   */
  get isActive(): boolean {
    return this._isActive;
  }

  /**
   * Whether the search provider is disposed or not.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Number of matches in the cell.
   */
  get matchesCount(): number {
    return this.isActive ? this.editorHighlighter.matches.length : 0;
  }

  get isCellSelected(): boolean {
    return this.cell.parent.isSelected(this.cell);
  }

  /**
   * Clear currently highlighted match
   */
  clearHighlight(): Promise<void> {
    this.currentIndex = undefined;
    this.editorHighlighter.clearHighlight();

    return Promise.resolve();
  }

  /**
   * Dispose the search provider
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this.toDispose.dispose();
    this._isDisposed = true;
    if (this.isActive) {
      this.endQuery().catch((reason) => {
        console.error(`Failed to end search query on cells.`, reason);
      });
    }
  }

  /**
   * Set `isActive` status.
   *
   * #### Notes
   * It will start or end the search
   *
   * @param v New value
   */
  async setIsActive(v: boolean): Promise<void> {
    if (this.isActive !== v) {
      this._isActive = v;
    }
    if (this.isActive) {
      if (this.query !== null) {
        await this.startQuery(this.query, this.filters);
      }
    } else {
      await this.endQuery();
    }
  }

  /**
   * Initialize the search using the provided options. Should update the UI
   * to highlight all matches and "select" the first match.
   *
   * @param query A RegExp to be use to perform the search
   * @param filters Filter parameters to pass to provider
   */
  async startQuery(query: RegExp | null, filters?: SearchFilters): Promise<void> {
    this.query = query;
    this.filters = filters;
    if (this.cell.hasInputHidden) {
      return;
    }
    await this.setEditor();
    // Search input
    await this.updateMatches();
  }

  /**
   * Stop the search and clean any UI elements.
   */
  async endQuery(): Promise<void> {
    this.currentIndex = undefined;
    this.query = null;
    await this.editorHighlighter.endQuery();
  }

  /**
   * Highlight the next match.
   *
   * @returns The next match if there is one.
   */
  async highlightNext(): Promise<SearchMatch | undefined> {
    if (this.matchesCount === 0 || !this.isActive) {
      this.currentIndex = undefined;
    } else {
      if (this.lastReplacementPosition) {
        this.cell.editor?.setCursorPosition(this.lastReplacementPosition);
        this.lastReplacementPosition = null;
      }

      // This starts from the cursor position
      const match = await this.editorHighlighter.highlightNext();

      if (match) {
        this.currentIndex = this.editorHighlighter.currentIndex;
      } else {
        this.currentIndex = undefined;
      }
      return match;
    }

    return Promise.resolve(this.getCurrentMatch());
  }

  /**
   * Highlight the previous match.
   *
   * @returns The previous match if there is one.
   */
  async highlightPrevious(): Promise<SearchMatch | undefined> {
    if (this.matchesCount === 0 || !this.isActive) {
      this.currentIndex = undefined;
    } else {
      // This starts from the cursor position
      const match = await this.editorHighlighter.highlightPrevious();
      if (match) {
        this.currentIndex = this.editorHighlighter.currentIndex;
      } else {
        this.currentIndex = undefined;
      }
      return match;
    }

    return Promise.resolve(this.getCurrentMatch());
  }

  /**
   * Replace the currently selected match with the provided text.
   *
   * If no match is selected, it won't do anything.
   *
   * @param newText The replacement text.
   * @returns Whether a replace occurred.
   */
  replaceCurrentMatch(newText: string): Promise<boolean> {
    if (!this.isActive) {
      return Promise.resolve(false);
    }

    let occurred = false;

    if (
      this.currentIndex !== undefined &&
      this.currentIndex < this.editorHighlighter.matches.length
    ) {
      const editor = this.cell.editor;
      const selection = editor?.getSelectionValue();
      const match = this.getCurrentMatch();
      if (!match) {
        return Promise.resolve(occurred);
      }
      // If cursor is not on a selection, highlight the next match
      if (selection !== match?.text) {
        this.currentIndex = undefined;
        // The next will be highlighted as a consequence of this returning false
      } else {
        this.editorHighlighter.matches.splice(this.currentIndex, 1);
        this.currentIndex = undefined;
        // Store the current position to highlight properly the next search hit
        this.lastReplacementPosition = editor?.getCursorPosition() ?? null;
        editor?.replaceSelection(newText, {
          start: editor.getPositionAt(match.position)!,
          end: editor.getPositionAt(match.position + match.text.length)!,
        });
        occurred = true;
      }
    }
    return Promise.resolve(occurred);
  }

  /**
   * Replace all matches in the cell source with the provided text
   *
   * @param newText The replacement text.
   * @returns Whether a replace occurred.
   */
  replaceAllMatches = (newText: string): Promise<boolean> => {
    if (!this.isActive) {
      return Promise.resolve(false);
    }

    const occurred = this.editorHighlighter.matches.length > 0;
    // const src = this.cell.model.value;
    // let lastEnd = 0;
    // const finalSrc = this.cmHandler.matches.reduce((agg, match) => {
    //   const start = match.position as number;
    //   const end = start + match.text.length;
    //   const newStep = `${agg}${src.slice(lastEnd, start)}${newText}`;
    //   lastEnd = end;
    //   return newStep;
    // }, '');

    const editor = this.cell.editor;
    if (occurred && editor) {
      const changes = this.editorHighlighter.matches.map((match) => ({
        range: {
          start: editor.getPositionAt(match.position)!,
          end: editor.getPositionAt(match.position + match.text.length)!,
        },
        text: newText,
      }));
      editor?.replaceSelections(changes);
      this.editorHighlighter.matches = [];
      this.currentIndex = undefined;
      // this.cell.model.setSource(`${finalSrc}${src.slice(lastEnd)}`);
    }
    return Promise.resolve(occurred);
  };

  /**
   * Get the current match if it exists.
   *
   * @returns The current match
   */
  protected getCurrentMatch(): SearchMatch | undefined {
    if (this.currentIndex === undefined) {
      return undefined;
    } else {
      let match: SearchMatch | undefined = undefined;
      if (this.currentIndex < this.editorHighlighter.matches.length) {
        match = this.editorHighlighter.matches[this.currentIndex];
      }
      return match;
    }
  }

  protected updateMatches = async () => {
    if (this.query !== null) {
      if (this.isActive) {
        const matches = await searchText(this.query, this.cell.model.value);
        this.editorHighlighter.matches = matches;
        if (this.isCellSelected) {
          const cursorOffset = this.cell.editor?.getOffsetAt(
            this.cell.editor?.getCursorPosition() ?? { column: 0, line: 0 },
          );
          if (cursorOffset === undefined) {
            return;
          }
          const index = matches.findIndex(
            (item) => item.position + item.text.length >= cursorOffset,
          );
          if (index >= 0) {
            this.currentIndex = index;
            this.editorHighlighter.currentIndex = index;
          }
        }
      } else {
        this.editorHighlighter.matches = [];
      }
    }
  };
}
