import { indentLess, indentMore, insertTab } from '@codemirror/commands';
import type { Command, EditorView } from '@codemirror/view';

import { completionState, startCompletionEffect } from './auto-complete/state.js';
import { startTooltip } from './tooltip.js';

/**
 * Indent or insert a tab as appropriate.
 */
export const indentMoreOrInsertTab: Command = (view: EditorView): boolean => {
  const from = view.state.selection.main.from;
  const to = view.state.selection.main.to;
  if (from !== to) {
    return indentMore(view);
  }
  const line = view.state.doc.lineAt(from);
  const before = view.state.doc.slice(line.from, from).toString();
  if (/^\s*$/.test(before)) {
    return indentMore(view);
  } else {
    return insertTab(view);
  }
};

/**
 * RegExp to test for leading whitespace
 */
const leadingWhitespaceRe = /^\s+$/;
export const indentOrCompletion: Command = (view: EditorView) => {
  const from = view.state.selection.main.from;

  const line = view.state.doc.lineAt(from);

  let shouldIndent = false;
  if (line.from === from) {
    shouldIndent = true;
  } else {
    shouldIndent =
      view.state.doc
        .slice(from - 1, from)
        .toString()
        .match(leadingWhitespaceRe) !== null;
  }

  if (shouldIndent) {
    return indentMoreOrInsertTab(view);
  } else {
    const cState = view.state.field(completionState, false);
    if (!cState) {
      return false;
    }
    view.dispatch({ effects: startCompletionEffect.of(true) });
    return true;
  }
};

export const indentOrTooltip: Command = (view: EditorView) => {
  const from = view.state.selection.main.from;
  const line = view.state.doc.lineAt(from);
  const shouldIndentLess =
    view.state.doc.slice(line.from, from).toString().match(leadingWhitespaceRe) !==
    null;

  if (shouldIndentLess) {
    return indentLess(view);
  } else {
    return startTooltip(view);
  }
};
