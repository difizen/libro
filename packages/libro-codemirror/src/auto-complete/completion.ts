/* eslint-disable @typescript-eslint/no-parameter-properties */
/* eslint-disable @typescript-eslint/parameter-properties */
import { syntaxTree } from '@codemirror/language';
import type { EditorState, TransactionSpec } from '@codemirror/state';
import { Annotation, EditorSelection } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import type { SyntaxNode } from '@lezer/common';

import type { ActiveResult } from './state.js';

/// Objects type used to represent individual completions.
export interface Completion {
  /// The label to show in the completion picker. This is what input
  /// is matched agains to determine whether a completion matches (and
  /// how well it matches).
  label: string;
  /// An optional short piece of information to show (with a different
  /// style) after the label.
  detail?: string;
  /// Additional info to show when the completion is selected. Can be
  /// a plain string or a function that'll render the DOM structure to
  /// show when invoked.
  info?: string | ((completion: Completion) => Node | null | Promise<Node | null>);
  /// How to apply the completion. The default is to replace it with
  /// its [label](#autocomplete.Completion.label). When this holds a
  /// string, the completion range is replaced by that string. When it
  /// is a function, that function is called to perform the
  /// completion. If it fires a transaction, it is responsible for
  /// adding the [`pickedCompletion`](#autocomplete.pickedCompletion)
  /// annotation to it.
  apply?:
    | string
    | ((view: EditorView, completion: Completion, from: number, to: number) => void);
  /// The type of the completion. This is used to pick an icon to show
  /// for the completion. Icons are styled with a CSS class created by
  /// appending the type name to `"cm-completionIcon-"`. You can
  /// define or restyle icons by defining these selectors. The base
  /// library defines simple icons for `class`, `constant`, `enum`,
  /// `function`, `interface`, `keyword`, `method`, `namespace`,
  /// `property`, `text`, `type`, and `variable`.
  ///
  /// Multiple types can be provided by separating them with spaces.
  type?: string;
  /// When given, should be a number from -99 to 99 that adjusts how
  /// this completion is ranked compared to other completions that
  /// match the input as well as this one. A negative number moves it
  /// down the list, a positive number moves it up.
  boost?: number;
}

/// An instance of this is passed to completion source functions.
export class CompletionContext {
  /// @internal
  abortListeners: (() => void)[] | null = [];

  /// Create a new completion context. (Mostly useful for testing
  /// completion sources—in the editor, the extension will create
  /// these for you.)
  constructor(
    /// The editor state that the completion happens in.
    readonly state: EditorState,
    /// The position at which the completion is happening.
    readonly pos: number,
    /// Indicates whether completion was activated explicitly, or
    /// implicitly by typing. The usual way to respond to this is to
    /// only return completions when either there is part of a
    /// completable entity before the cursor, or `explicit` is true.
    readonly explicit: boolean,
  ) {}

  /// Get the extent, content, and (if there is a token) type of the
  /// token before `this.pos`.
  tokenBefore(types: readonly string[]) {
    let token: SyntaxNode | null = syntaxTree(this.state).resolveInner(this.pos, -1);
    while (token && types.indexOf(token.name) < 0) {
      token = token.parent;
    }
    return token
      ? {
          from: token.from,
          to: this.pos,
          text: this.state.sliceDoc(token.from, this.pos),
          type: token.type,
        }
      : null;
  }

  /// Get the match of the given expression directly before the
  /// cursor.
  matchBefore(expr: RegExp) {
    const line = this.state.doc.lineAt(this.pos);
    const start = Math.max(line.from, this.pos - 250);
    const str = line.text.slice(start - line.from, this.pos - line.from);
    const found = str.search(ensureAnchor(expr, false));
    return found < 0
      ? null
      : { from: start + found, to: this.pos, text: str.slice(found) };
  }

  /// Yields true when the query has been aborted. Can be useful in
  /// asynchronous queries to avoid doing work that will be ignored.
  get aborted() {
    return this.abortListeners === null;
  }

  /// Allows you to register abort handlers, which will be called when
  /// the query is
  /// [aborted](#autocomplete.CompletionContext.aborted).
  addEventListener(type: 'abort', listener: () => void) {
    if (type === 'abort' && this.abortListeners) {
      this.abortListeners.push(listener);
    }
  }
}

function toSet(chars: Record<string, true>) {
  let flat = Object.keys(chars).join('');
  const words = /\w/.test(flat);
  if (words) {
    flat = flat.replace(/\w/g, '');
  }
  return `[${words ? '\\w' : ''}${flat.replace(/[^\w\s]/g, '\\$&')}]`;
}

function prefixMatch(options: readonly Completion[]) {
  const first = Object.create(null),
    rest = Object.create(null);
  for (const { label } of options) {
    first[label[0]] = true;
    for (let i = 1; i < label.length; i++) {
      rest[label[i]] = true;
    }
  }
  const source = toSet(first) + toSet(rest) + '*$';
  return [new RegExp('^' + source), new RegExp(source)];
}

/// Given a a fixed array of options, return an autocompleter that
/// completes them.
export function completeFromList(
  list: readonly (string | Completion)[],
): CompletionSource {
  const options = list.map((o) => (typeof o === 'string' ? { label: o } : o));
  const [validFor, match] = options.every((o) => /^\w+$/.test(o.label))
    ? [/\w*$/, /\w+$/]
    : prefixMatch(options);
  return (context: CompletionContext) => {
    const token = context.matchBefore(match);
    return token || context.explicit
      ? { from: token ? token.from : context.pos, options, validFor }
      : null;
  };
}

/// Wrap the given completion source so that it will only fire when the
/// cursor is in a syntax node with one of the given names.
export function ifIn(
  nodes: readonly string[],
  source: CompletionSource,
): CompletionSource {
  return (context: CompletionContext) => {
    for (
      let pos: SyntaxNode | null = syntaxTree(context.state).resolveInner(
        context.pos,
        -1,
      );
      pos;
      pos = pos.parent
    ) {
      if (nodes.indexOf(pos.name) > -1) {
        return source(context);
      }
    }
    return null;
  };
}

/// Wrap the given completion source so that it will not fire when the
/// cursor is in a syntax node with one of the given names.
export function ifNotIn(
  nodes: readonly string[],
  source: CompletionSource,
): CompletionSource {
  return (context: CompletionContext) => {
    for (
      let pos: SyntaxNode | null = syntaxTree(context.state).resolveInner(
        context.pos,
        -1,
      );
      pos;
      pos = pos.parent
    ) {
      if (nodes.indexOf(pos.name) > -1) {
        return null;
      }
    }
    return source(context);
  };
}

/// The function signature for a completion source. Such a function
/// may return its [result](#autocomplete.CompletionResult)
/// synchronously or as a promise. Returning null indicates no
/// completions are available.
export type CompletionSource = (
  context: CompletionContext,
) => CompletionResult | null | Promise<CompletionResult | null>;

/// Interface for objects returned by completion sources.
export interface CompletionResult {
  /// The start of the range that is being completed.
  from: number;
  /// The end of the range that is being completed. Defaults to the
  /// main cursor position.
  to?: number;
  /// The completions returned. These don't have to be compared with
  /// the input by the source—the autocompletion system will do its
  /// own matching (against the text between `from` and `to`) and
  /// sorting.
  options: readonly Completion[];
  /// When given, further typing or deletion that causes the part of
  /// the document between ([mapped](#state.ChangeDesc.mapPos)) `from`
  /// and `to` to match this regular expression or predicate function
  /// will not query the completion source again, but continue with
  /// this list of options. This can help a lot with responsiveness,
  /// since it allows the completion list to be updated synchronously.
  validFor?:
    | RegExp
    | ((text: string, from: number, to: number, state: EditorState) => boolean);
  /// By default, the library filters and scores completions. Set
  /// `filter` to `false` to disable this, and cause your completions
  /// to all be included, in the order they were given. When there are
  /// other sources, unfiltered completions appear at the top of the
  /// list of completions. `validFor` must not be given when `filter`
  /// is `false`, because it only works when filtering.
  filter?: boolean;
  /// When [`filter`](#autocomplete.CompletionResult.filter) is set to
  /// `false`, this may be provided to compute the ranges on the label
  /// that match the input. Should return an array of numbers where
  /// each pair of adjacent numbers provide the start and end of a
  /// range.
  getMatch?: (completion: Completion) => readonly number[];
  /// Synchronously update the completion result after typing or
  /// deletion. If given, this should not do any expensive work, since
  /// it will be called during editor state updates. The function
  /// should make sure (similar to
  /// [`validFor`](#autocomplete.CompletionResult.validFor)) that the
  /// completion still applies in the new state.
  update?: (
    current: CompletionResult,
    from: number,
    to: number,
    context: CompletionContext,
  ) => CompletionResult | null;
}

export class Option {
  constructor(
    readonly completion: Completion,
    readonly source: ActiveResult,
    readonly match: readonly number[],
  ) {}
}

export function cur(state: EditorState) {
  return state.selection.main.head;
}

// Make sure the given regexp has a $ at its end and, if `start` is
// true, a ^ at its start.
export function ensureAnchor(expr: RegExp, start: boolean) {
  const { source } = expr;
  const addStart = start && source[0] !== '^',
    addEnd = source[source.length - 1] !== '$';
  if (!addStart && !addEnd) {
    return expr;
  }
  return new RegExp(
    `${addStart ? '^' : ''}(?:${source})${addEnd ? '$' : ''}`,
    expr.flags ?? (expr.ignoreCase ? 'i' : ''),
  );
}

/// This annotation is added to transactions that are produced by
/// picking a completion.
export const pickedCompletion = Annotation.define<Completion>();

/// Helper function that returns a transaction spec which inserts a
/// completion's text in the main selection range, and any other
/// selection range that has the same text in front of it.
export function insertCompletionText(
  state: EditorState,
  text: string,
  from: number,
  to: number,
): TransactionSpec {
  return {
    ...state.changeByRange((range) => {
      if (range === state.selection.main) {
        return {
          changes: { from: from, to: to, insert: text },
          range: EditorSelection.cursor(from + text.length),
        };
      }
      const len = to - from;
      if (
        !range.empty ||
        (len &&
          state.sliceDoc(range.from - len, range.from) !== state.sliceDoc(from, to))
      ) {
        return { range };
      }
      return {
        changes: { from: range.from - len, to: range.from, insert: text },
        range: EditorSelection.cursor(range.from - len + text.length),
      };
    }),
    userEvent: 'input.complete',
  };
}

export function applyCompletion(view: EditorView, option: Option) {
  const apply = option.completion.apply || option.completion.label;
  const result = option.source;
  if (typeof apply === 'string') {
    view.dispatch(insertCompletionText(view.state, apply, result.from, result.to));
  } else {
    apply(view, option.completion, result.from, result.to);
  }
}

const SourceCache = new WeakMap<readonly (string | Completion)[], CompletionSource>();

export function asSource(
  source: CompletionSource | readonly (string | Completion)[],
): CompletionSource {
  if (!Array.isArray(source)) {
    return source as CompletionSource;
  }
  let known = SourceCache.get(source);
  if (!known) {
    SourceCache.set(source, (known = completeFromList(source)));
  }
  return known;
}
