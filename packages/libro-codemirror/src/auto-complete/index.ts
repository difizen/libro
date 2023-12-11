/* eslint-disable @typescript-eslint/no-use-before-define */
import type { Extension, EditorState, StateEffect } from '@codemirror/state';
import { Prec } from '@codemirror/state';
import type { KeyBinding } from '@codemirror/view';
import { keymap } from '@codemirror/view';

import { indentOrCompletion, indentOrTooltip } from '../indent.js';

import type { Completion, Option } from './completion.js';
import type { CompletionConfig } from './config.js';
import { completionConfig } from './config.js';
import { completionState, State, setSelectedEffect } from './state.js';
import { baseTheme } from './theme.js';
import {
  completionPlugin,
  moveCompletionSelection,
  acceptCompletion,
  closeCompletion,
} from './view.js';

export * from './snippet.js';
export * from './completion.js';
export * from './view.js';
export * from './word.js';
export * from './closebrackets.js';

/// Returns an extension that enables autocompletion.
export function autocompletion(config: CompletionConfig = {}): Extension {
  return [
    completionState,
    completionConfig.of(config),
    completionPlugin,
    completionKeymapExt,
    baseTheme,
  ];
}

/// Basic keybindings for autocompletion.
///
///  - Ctrl-Space: [`startCompletion`](#autocomplete.startCompletion)
///  - Escape: [`closeCompletion`](#autocomplete.closeCompletion)
///  - ArrowDown: [`moveCompletionSelection`](#autocomplete.moveCompletionSelection)`(true)`
///  - ArrowUp: [`moveCompletionSelection`](#autocomplete.moveCompletionSelection)`(false)`
///  - PageDown: [`moveCompletionSelection`](#autocomplete.moveCompletionSelection)`(true, "page")`
///  - PageDown: [`moveCompletionSelection`](#autocomplete.moveCompletionSelection)`(true, "page")`
///  - Enter: [`acceptCompletion`](#autocomplete.acceptCompletion)
export const completionKeymap: readonly KeyBinding[] = [
  { key: 'Tab', run: indentOrCompletion, shift: indentOrTooltip },
  { key: 'Escape', run: closeCompletion },
  { key: 'ArrowDown', run: moveCompletionSelection(true) },
  { key: 'ArrowUp', run: moveCompletionSelection(false) },
  { key: 'PageDown', run: moveCompletionSelection(true, 'page') },
  { key: 'PageUp', run: moveCompletionSelection(false, 'page') },
  { key: 'Enter', run: acceptCompletion },
];

const completionKeymapExt = Prec.highest(
  keymap.computeN([completionConfig], (state) =>
    state.facet(completionConfig).defaultKeymap ? [completionKeymap] : [],
  ),
);

/// Get the current completion status. When completions are available,
/// this will return `"active"`. When completions are pending (in the
/// process of being queried), this returns `"pending"`. Otherwise, it
/// returns `null`.
export function completionStatus(state: EditorState): null | 'active' | 'pending' {
  const cState = state.field(completionState, false);
  return cState && cState.active.some((a) => a.state === State.Pending)
    ? 'pending'
    : cState && cState.active.some((a) => a.state !== State.Inactive)
      ? 'active'
      : null;
}

const completionArrayCache: WeakMap<readonly Option[], readonly Completion[]> =
  new WeakMap();

/// Returns the available completions as an array.
export function currentCompletions(state: EditorState): readonly Completion[] {
  const open = state.field(completionState, false)?.open;
  if (!open) {
    return [];
  }
  let completions = completionArrayCache.get(open.options);
  if (!completions) {
    completionArrayCache.set(
      open.options,
      (completions = open.options.map((o) => o.completion)),
    );
  }
  return completions;
}

/// Return the currently selected completion, if any.
export function selectedCompletion(state: EditorState): Completion | null {
  const open = state.field(completionState, false)?.open;
  return open && open.selected >= 0 ? open.options[open.selected].completion : null;
}

/// Returns the currently selected position in the active completion
/// list, or null if no completions are active.
export function selectedCompletionIndex(state: EditorState): number | null {
  const open = state.field(completionState, false)?.open;
  return open && open.selected >= 0 ? open.selected : null;
}

/// Create an effect that can be attached to a transaction to change
/// the currently selected completion.
export function setSelectedCompletion(index: number): StateEffect<unknown> {
  return setSelectedEffect.of(index);
}
