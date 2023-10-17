import type { IPosition } from '@difizen/libro-code-editor';
import type { CodeMirrorEditor } from '@difizen/libro-codemirror';
import type { LibroCodeCellView } from '@difizen/libro-codemirror-code-cell';
import type {
  BaseSearchProvider,
  SearchFilters,
  SearchMatch,
} from '@difizen/libro-search';
import { searchText } from '@difizen/libro-search';
import type { Event } from '@difizen/mana-app';
import { inject, transient } from '@difizen/mana-app';
import { DisposableCollection, Emitter } from '@difizen/mana-app';
import { prop, watch } from '@difizen/mana-app';

import type { CodeMirrorSearchHighlighter } from './codemirror-search-highlighter.js';
import { CodeMirrorSearchHighlighterFactory } from './codemirror-search-protocol.js';
/**
 * Search provider for cells.
 */
@transient()
export class CodemirrorCellSearchProvider implements BaseSearchProvider {
  protected toDispose = new DisposableCollection();
  /**
   * CodeMirror search highlighter
   */
  @prop() protected cmHandler: CodeMirrorSearchHighlighter;
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
  protected highlighterFactory: CodeMirrorSearchHighlighterFactory;
  protected cell: LibroCodeCellView;
  /**
   * Constructor
   *
   * @param cell Cell widget
   */
  constructor(
    @inject(CodeMirrorSearchHighlighterFactory)
    highlighterFactory: CodeMirrorSearchHighlighterFactory,
    cell: LibroCodeCellView,
  ) {
    this.cell = cell;
    this.highlighterFactory = highlighterFactory;
    this.currentIndex = undefined;
    this.stateChangedEmitter = new Emitter<void>();
    this.toDispose.push(this.stateChangedEmitter);
    this.cmHandler = this.highlighterFactory(
      this.cell.editor as CodeMirrorEditor | undefined,
    );

    this.toDispose.push(watch(this.cell.model, 'value', this.updateCodeMirror));
    this.toDispose.push(
      watch(this.cell, 'editor', async () => {
        await this.cell.editorReady;
        if (this.cell.hasInputHidden === true) {
          this.endQuery();
        } else {
          this.startQuery(this.query, this.filters);
        }
      }),
    );
  }

  /**
   * Get an initial query value if applicable so that it can be entered
   * into the search box as an initial query
   *
   * @returns Initial value used to populate the search box.
   */
  getInitialQuery(): string {
    const editor = this.cell?.editor as CodeMirrorEditor | undefined;
    const selection = editor?.state.sliceDoc(
      editor?.state.selection.main.from,
      editor?.state.selection.main.to,
    );
    // if there are newlines, just return empty string
    return selection?.search(/\r?\n|\r/g) === -1 ? selection : '';
  }

  disposed?: boolean | undefined;

  protected async setEditor() {
    await this.cell.editorReady;
    if (this.cell.editor) {
      this.cmHandler.setEditor(this.cell.editor as CodeMirrorEditor);
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
    return this.isActive ? this.cmHandler.matches.length : 0;
  }

  /**
   * Clear currently highlighted match
   */
  clearHighlight(): Promise<void> {
    this.currentIndex = undefined;
    this.cmHandler.clearHighlight();

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
    await this.updateCodeMirror();
  }

  /**
   * Stop the search and clean any UI elements.
   */
  async endQuery(): Promise<void> {
    this.currentIndex = undefined;
    this.query = null;
    await this.cmHandler.endQuery();
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
      const match = await this.cmHandler.highlightNext();
      if (match) {
        this.currentIndex = this.cmHandler.currentIndex;
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
      const match = await this.cmHandler.highlightPrevious();
      if (match) {
        this.currentIndex = this.cmHandler.currentIndex;
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
      this.currentIndex < this.cmHandler.matches.length
    ) {
      const editor = this.cell.editor as CodeMirrorEditor;
      const selection = editor.state.sliceDoc(
        editor.state.selection.main.from,
        editor.state.selection.main.to,
      );
      const match = this.getCurrentMatch();
      // If cursor is not on a selection, highlight the next match
      if (selection !== match?.text) {
        this.currentIndex = undefined;
        // The next will be highlighted as a consequence of this returning false
      } else {
        this.cmHandler.matches.splice(this.currentIndex, 1);
        this.currentIndex = undefined;
        // Store the current position to highlight properly the next search hit
        this.lastReplacementPosition = editor.getCursorPosition();
        editor.editor.dispatch({
          changes: {
            from: match.position,
            to: match.position + match.text.length,
            insert: newText,
          },
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

    const occurred = this.cmHandler.matches.length > 0;
    // const src = this.cell.model.value;
    // let lastEnd = 0;
    // const finalSrc = this.cmHandler.matches.reduce((agg, match) => {
    //   const start = match.position as number;
    //   const end = start + match.text.length;
    //   const newStep = `${agg}${src.slice(lastEnd, start)}${newText}`;
    //   lastEnd = end;
    //   return newStep;
    // }, '');

    if (occurred) {
      const editor = this.cell.editor as CodeMirrorEditor;
      const changes = this.cmHandler.matches.map((match) => ({
        from: match.position,
        to: match.position + match.text.length,
        insert: newText,
      }));
      editor.editor.dispatch({
        changes,
      });
      this.cmHandler.matches = [];
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
      if (this.currentIndex < this.cmHandler.matches.length) {
        match = this.cmHandler.matches[this.currentIndex];
      }
      return match;
    }
  }

  protected updateCodeMirror = async () => {
    if (this.query !== null) {
      if (this.isActive) {
        this.cmHandler.matches = await searchText(this.query, this.cell.model.value);
      } else {
        this.cmHandler.matches = [];
      }
    }
  };
}
