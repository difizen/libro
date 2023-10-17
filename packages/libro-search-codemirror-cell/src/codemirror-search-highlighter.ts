/* eslint-disable no-param-reassign */
import type { StateEffectType } from '@codemirror/state';
import { StateEffect, StateField } from '@codemirror/state';
import type { DecorationSet } from '@codemirror/view';
import { Decoration, EditorView } from '@codemirror/view';
import type { CodeMirrorEditor } from '@difizen/libro-codemirror';
import { deepEqual } from '@difizen/libro-common';
import type { SearchMatch } from '@difizen/libro-search';
import { LibroSearchUtils } from '@difizen/libro-search';
import { inject, transient } from '@difizen/mana-app';
import { prop } from '@difizen/mana-app';
/**
 * Helper class to highlight texts in a code mirror editor.
 *
 * Highlighted texts (aka `matches`) must be provided through
 * the `matches` attributes.
 */
@transient()
export class CodeMirrorSearchHighlighter {
  utils: LibroSearchUtils;
  protected cm: CodeMirrorEditor | undefined;
  @prop() _currentIndex: number | undefined;
  @prop() protected _matches: SearchMatch[];
  protected highlightEffect: StateEffectType<{
    matches: SearchMatch[];
    currentIndex: number | undefined;
  }>;
  protected highlightMark: Decoration;
  protected selectedMatchMark: Decoration;
  protected highlightField: StateField<DecorationSet>;

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
  constructor(@inject(LibroSearchUtils) utils: LibroSearchUtils) {
    this.utils = utils;
    this._matches = new Array<SearchMatch>();
    this.currentIndex = undefined;

    this.highlightEffect = StateEffect.define<{
      matches: SearchMatch[];
      currentIndex: number | undefined;
    }>({
      map: (value, mapping) => ({
        matches: value.matches.map((v) => ({
          text: v.text,
          position: mapping.mapPos(v.position),
        })),
        currentIndex: value.currentIndex,
      }),
    });
    this.highlightMark = Decoration.mark({ class: 'cm-searchMatch' });
    this.selectedMatchMark = Decoration.mark({
      class: 'cm-searchMatch cm-searchMatch-selected libro-selectedtext',
    });
    this.highlightField = StateField.define<DecorationSet>({
      create: () => {
        return Decoration.none;
      },
      update: (highlights, transaction) => {
        highlights = highlights.map(transaction.changes);
        for (const ef of transaction.effects) {
          if (ef.is(this.highlightEffect)) {
            const e = ef as StateEffect<{
              matches: SearchMatch[];
              currentIndex: number | undefined;
            }>;
            if (e.value.matches.length) {
              highlights = highlights.update({
                add: e.value.matches.map((m, index) => {
                  if (index === e.value.currentIndex) {
                    return this.selectedMatchMark.range(
                      m.position,
                      m.position + m.text.length,
                    );
                  }
                  return this.highlightMark.range(
                    m.position,
                    m.position + m.text.length,
                  );
                }),
                filter: (from, to) => {
                  return (
                    !e.value.matches.some(
                      (m) => m.position >= from && m.position + m.text.length <= to,
                    ) || from === to
                  );
                },
              });
            } else {
              highlights = Decoration.none;
            }
          }
        }
        return highlights;
      },
      provide: (f) => EditorView.decorations.from(f),
    });
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

    if (this.cm) {
      this.cm.editor.dispatch({
        effects: this.highlightEffect.of({ matches: [], currentIndex: undefined }),
      });

      const selection = this.cm.state.selection.main;
      const from = selection.from;
      const to = selection.to;
      // Setting a reverse selection to allow search-as-you-type to maintain the
      // current selected match. See comment in _findNext for more details.
      if (from !== to) {
        this.cm.editor.dispatch({ selection: { anchor: to, head: from } });
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
  setEditor(editor: CodeMirrorEditor): void {
    this.cm = editor;
    this.refresh();
    if (this.currentIndex !== undefined) {
      this._highlightCurrentMatch();
    }
  }

  protected _highlightCurrentMatch(): void {
    if (!this.cm) {
      // no-op
      return;
    }

    // Highlight the current index
    if (this.currentIndex !== undefined) {
      const match = this.matches[this.currentIndex];
      // this.cm.editor.focus();
      this.cm.editor.dispatch({
        selection: {
          anchor: match.position,
          head: match.position + match.text.length,
        },
        scrollIntoView: true,
      });
    } else {
      // Set cursor to remove any selection
      this.cm.editor.dispatch({ selection: { anchor: 0 } });
    }
  }

  protected refresh(): void {
    if (!this.cm) {
      // no-op
      return;
    }
    const effects: StateEffect<unknown>[] = [
      this.highlightEffect.of({
        matches: this.matches,
        currentIndex: this.currentIndex,
      }),
    ];
    if (!this.cm.state.field(this.highlightField, false)) {
      effects.push(StateEffect.appendConfig.of([this.highlightField]));
    }
    this.cm.editor.dispatch({ effects });
  }

  protected _findNext(reverse: boolean): number | undefined {
    if (this.matches.length === 0) {
      // No-op
      return undefined;
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

    const cursor = this.cm!.state.selection.main;

    let lastPosition = reverse ? cursor.anchor : cursor.head;
    if (lastPosition === 0 && reverse && this.currentIndex === undefined) {
      // The default position is (0, 0) but we want to start from the end in that case
      lastPosition = this.cm!.doc.length;
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
