/* eslint-disable no-param-reassign */
import type { IEditor, SearchMatch } from '@difizen/libro-code-editor';
import { deepEqual } from '@difizen/libro-common';
import { LibroSearchUtils } from '@difizen/libro-search';
import { prop } from '@difizen/mana-app';
import { inject, transient } from '@difizen/mana-app';

import type { CodeEditorSearchHighlighter } from './code-cell-search-protocol.js';

/**
 * Helper class to highlight texts in a code mirror editor.
 *
 * Highlighted texts (aka `matches`) must be provided through
 * the `matches` attributes.
 */
@transient()
export class GenericSearchHighlighter implements CodeEditorSearchHighlighter {
  @inject(LibroSearchUtils) utils: LibroSearchUtils;

  protected editor: IEditor | undefined;
  @prop() _currentIndex: number | undefined;
  @prop() protected _matches: SearchMatch[];

  /**
   * The list of matches
   */
  get matches(): SearchMatch[] {
    return this._matches;
  }
  set matches(v: SearchMatch[]) {
    if (!deepEqual(this._matches as any, v as any)) {
      this._matches = v;
    }
    this.refresh();
  }

  get currentIndex(): number | undefined {
    return this._currentIndex;
  }
  set currentIndex(v: number | undefined) {
    this._currentIndex = v;
    this.refresh();
  }

  /**
   * Constructor
   *
   * @param editor The CodeMirror editor
   */
  constructor() {
    this._matches = new Array<SearchMatch>();
    this.currentIndex = undefined;
  }

  /**
   * Clear all highlighted matches
   */
  clearHighlight(): void {
    this.currentIndex = undefined;
    this._highlightCurrentMatch();
  }

  /**
   * Clear the highlighted matches.
   */
  endQuery(): Promise<void> {
    this._currentIndex = undefined;
    this._matches = [];

    if (this.editor) {
      this.editor.highlightMatches([], undefined);

      const selection = this.editor.getSelection();

      const start = this.editor.getOffsetAt(selection.start);
      const end = this.editor.getOffsetAt(selection.end);

      // Setting a reverse selection to allow search-as-you-type to maintain the
      // current selected match. See comment in _findNext for more details.
      if (start !== end) {
        this.editor.setSelection(selection);
      }
    }

    return Promise.resolve();
  }

  /**
   * Highlight the next match
   *
   * @returns The next match if available
   */
  highlightNext(): Promise<SearchMatch | undefined> {
    this.currentIndex = this._findNext(false);
    this._highlightCurrentMatch();
    return Promise.resolve(
      this.currentIndex !== undefined ? this._matches[this.currentIndex] : undefined,
    );
  }

  /**
   * Highlight the previous match
   *
   * @returns The previous match if available
   */
  highlightPrevious(): Promise<SearchMatch | undefined> {
    this.currentIndex = this._findNext(true);
    this._highlightCurrentMatch();
    return Promise.resolve(
      this.currentIndex !== undefined ? this._matches[this.currentIndex] : undefined,
    );
  }

  /**
   * Set the editor
   *
   * @param editor Editor
   */
  setEditor(editor: IEditor): void {
    this.editor = editor;
    this.refresh();
    if (this.currentIndex !== undefined) {
      this._highlightCurrentMatch();
    }
  }

  protected _highlightCurrentMatch(): void {
    if (!this.editor) {
      // no-op
      return;
    }

    // Highlight the current index
    if (this.currentIndex !== undefined) {
      const match = this.matches[this.currentIndex];
      // this.cm.editor.focus();
      const start = this.editor.getPositionAt(match.position);
      const end = this.editor.getPositionAt(match.position + match.text.length);
      if (start && end) {
        this.editor.setSelection({ start, end });
        this.editor.revealSelection({ start, end });
      }
    } else {
      const start = this.editor.getPositionAt(0)!;
      const end = this.editor.getPositionAt(0)!;
      // Set cursor to remove any selection
      this.editor.setSelection({ start, end });
    }
  }

  protected refresh(): void {
    if (!this.editor) {
      // no-op
      return;
    }
    this.editor.highlightMatches(this.matches, this.currentIndex);
  }

  protected _findNext(reverse: boolean): number | undefined {
    if (this.matches.length === 0) {
      // No-op
      return undefined;
    }
    if (!this.editor) {
      return;
    }
    // In order to support search-as-you-type, we needed a way to allow the first
    // match to be selected when a search is started, but prevent the selected
    // search to move for each new keypress.  To do this, when a search is ended,
    // the cursor is reversed, putting the head at the 'from' position.  When a new
    // search is started, the cursor we want is at the 'from' position, so that the same
    // match is selected when the next key is entered (if it is still a match).
    //
    // When toggling through a search normally, the cursor is always set in the forward
    // direction, so head is always at the 'to' position.  That way, if reverse = false,
    // the search proceeds from the 'to' position during normal toggling.  If reverse = true,
    // the search always proceeds from the 'anchor' position, which is at the 'from'.

    const selection = this.editor?.getSelection();

    const start = this.editor?.getOffsetAt(selection.start);
    const end = this.editor.getOffsetAt(selection.end);
    let lastPosition = reverse ? start : end;
    if (lastPosition === 0 && reverse && this.currentIndex === undefined) {
      // The default position is (0, 0) but we want to start from the end in that case
      lastPosition = this.editor.model.value.length;
    }

    const position = lastPosition;

    let found = this.utils.findNext(this.matches, position, 0, this.matches.length - 1);
    if (found === undefined) {
      // Don't loop
      return reverse ? this.matches.length - 1 : undefined;
    }

    if (reverse) {
      found -= 1;
      if (found < 0) {
        // Don't loop
        return undefined;
      }
    }

    return found;
  }
}
