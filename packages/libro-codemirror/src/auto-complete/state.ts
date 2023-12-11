/* eslint-disable @typescript-eslint/no-this-alias */
import type { Transaction, EditorState, ChangeDesc } from '@codemirror/state';
import { StateField, StateEffect } from '@codemirror/state';
import type { Tooltip } from '@codemirror/view';
import { EditorView, showTooltip } from '@codemirror/view';

import type { CompletionSource, CompletionResult, Completion } from './completion.js';
import {
  Option,
  cur,
  asSource,
  ensureAnchor,
  CompletionContext,
} from './completion.js';
import type { CompletionConfig } from './config.js';
import { completionConfig } from './config.js';
import { FuzzyMatcher } from './filter.js';
import { completionTooltip } from './tooltip.js';

// Used to pick a preferred option when two options with the same
// label occur in the result.
function score(option: Completion) {
  return (
    (option.boost || 0) * 100 +
    (option.apply ? 10 : 0) +
    (option.info ? 5 : 0) +
    (option.type ? 1 : 0)
  );
}

function sortOptions(active: readonly ActiveSource[], state: EditorState) {
  const options = [];
  let i = 0;
  for (const a of active) {
    if (a.hasResult()) {
      if (a.result.filter === false) {
        const getMatch = a.result.getMatch;
        for (const option of a.result.options) {
          const match = [1e9 - i++];
          if (getMatch) {
            for (const n of getMatch(option)) {
              match.push(n);
            }
          }
          options.push(new Option(option, a, match));
        }
      } else {
        const matcher = new FuzzyMatcher(state.sliceDoc(a.from, a.to));
        let match;
        for (const option of a.result.options) {
          if ((match = matcher.match(option.label))) {
            if (option.boost) {
              match[0] += option.boost;
            }
            options.push(new Option(option, a, match));
          }
        }
      }
    }
  }
  const result = [];
  let prev = null;
  const compare = state.facet(completionConfig).compareCompletions;
  for (const opt of options.sort(
    (a, b) => b.match[0] - a.match[0] || compare(a.completion, b.completion),
  )) {
    if (
      !prev ||
      prev.label !== opt.completion.label ||
      prev.detail !== opt.completion.detail ||
      (prev.type && opt.completion.type && prev.type !== opt.completion.type) ||
      prev.apply !== opt.completion.apply
    ) {
      result.push(opt);
    } else if (score(opt.completion) > score(prev)) {
      result[result.length - 1] = opt;
    }
    prev = opt.completion;
  }
  return result;
}

class CompletionDialog {
  constructor(
    readonly options: readonly Option[],
    readonly attrs: Record<string, string>,
    readonly tooltip: Tooltip,
    readonly timestamp: number,
    readonly selected: number,
  ) {}

  setSelected(selected: number, id: string) {
    return selected === this.selected || selected >= this.options.length
      ? this
      : new CompletionDialog(
          this.options,
          makeAttrs(id, selected),
          this.tooltip,
          this.timestamp,
          selected,
        );
  }

  static build(
    active: readonly ActiveSource[],
    state: EditorState,
    id: string,
    prev: CompletionDialog | null,
    conf: Required<CompletionConfig>,
  ): CompletionDialog | null {
    const options = sortOptions(active, state);
    if (!options.length) {
      return null;
    }
    let selected = state.facet(completionConfig).selectOnOpen ? 0 : -1;
    if (prev && prev.selected !== selected && prev.selected !== -1) {
      const selectedValue = prev.options[prev.selected].completion;
      for (let i = 0; i < options.length; i++) {
        if (options[i].completion === selectedValue) {
          selected = i;
          break;
        }
      }
    }
    return new CompletionDialog(
      options,
      makeAttrs(id, selected),
      {
        pos: active.reduce((a, b) => (b.hasResult() ? Math.min(a, b.from) : a), 1e8),
        create: completionTooltip(completionState),
        above: conf.aboveCursor,
      },
      prev ? prev.timestamp : Date.now(),
      selected,
    );
  }

  map(changes: ChangeDesc) {
    return new CompletionDialog(
      this.options,
      this.attrs,
      { ...this.tooltip, pos: changes.mapPos(this.tooltip.pos) },
      this.timestamp,
      this.selected,
    );
  }
}

export class CompletionState {
  constructor(
    readonly active: readonly ActiveSource[],
    readonly id: string,
    readonly open: CompletionDialog | null,
  ) {}

  static start() {
    return new CompletionState(
      none,
      'cm-ac-' + Math.floor(Math.random() * 2e6).toString(36),
      null,
    );
  }

  update(tr: Transaction) {
    const { state } = tr;
    const conf = state.facet(completionConfig);
    const sources =
      conf.override ||
      state
        .languageDataAt<CompletionSource | readonly (string | Completion)[]>(
          'autocomplete',
          cur(state),
        )
        .map(asSource);
    let active: readonly ActiveSource[] = sources.map((source) => {
      const value =
        this.active.find((s) => s.source === source) ||
        new ActiveSource(
          source,
          this.active.some((a) => a.state !== State.Inactive)
            ? State.Pending
            : State.Inactive,
        );
      return value.update(tr, conf);
    });
    if (
      active.length === this.active.length &&
      active.every((a, i) => a === this.active[i])
    ) {
      active = this.active;
    }

    let open =
      tr.selection ||
      active.some((a) => a.hasResult() && tr.changes.touchesRange(a.from, a.to)) ||
      !sameResults(active, this.active)
        ? CompletionDialog.build(active, state, this.id, this.open, conf)
        : this.open && tr.docChanged
          ? this.open.map(tr.changes)
          : this.open;
    if (
      !open &&
      active.every((a) => a.state !== State.Pending) &&
      active.some((a) => a.hasResult())
    ) {
      active = active.map((a) =>
        a.hasResult() ? new ActiveSource(a.source, State.Inactive) : a,
      );
    }
    for (const effect of tr.effects) {
      if (effect.is(setSelectedEffect)) {
        open = open && open.setSelected(effect.value, this.id);
      }
    }

    return active === this.active && open === this.open
      ? this
      : new CompletionState(active, this.id, open);
  }

  get tooltip(): Tooltip | null {
    return this.open ? this.open.tooltip : null;
  }

  get attrs() {
    return this.open ? this.open.attrs : baseAttrs;
  }
}

function sameResults(a: readonly ActiveSource[], b: readonly ActiveSource[]) {
  if (a === b) {
    return true;
  }
  for (let iA = 0, iB = 0; ; ) {
    while (iA < a.length && !a[iA].hasResult) {
      iA++;
    }
    while (iB < b.length && !b[iB].hasResult) {
      iB++;
    }
    const endA = iA === a.length,
      endB = iB === b.length;
    if (endA || endB) {
      return endA === endB;
    }
    if ((a[iA++] as ActiveResult).result !== (b[iB++] as ActiveResult).result) {
      return false;
    }
  }
}

const baseAttrs = {
  'aria-autocomplete': 'list',
};

function makeAttrs(id: string, selected: number) {
  const result: Record<string, string> = {
    'aria-autocomplete': 'list',
    'aria-haspopup': 'listbox',
    'aria-controls': id,
  };
  if (selected > -1) {
    result['aria-activedescendant'] = id + '-' + selected;
  }
  return result;
}

const none: readonly any[] = [];

export const enum State {
  Inactive = 0,
  Pending = 1,
  Result = 2,
}

export function getUserEvent(tr: Transaction): 'input' | 'delete' | null {
  return tr.isUserEvent('input.type')
    ? 'input'
    : tr.isUserEvent('delete.backward')
      ? 'delete'
      : null;
}

export class ActiveSource {
  constructor(
    readonly source: CompletionSource,
    readonly state: State,
    readonly explicitPos: number = -1,
  ) {}

  hasResult(): this is ActiveResult {
    return false;
  }

  update(tr: Transaction, conf: Required<CompletionConfig>): ActiveSource {
    const event = getUserEvent(tr);
    let value: ActiveSource = this;
    if (event) {
      value = value.handleUserEvent(tr, event, conf);
    } else if (tr.docChanged) {
      value = value.handleChange(tr);
    } else if (tr.selection && value.state !== State.Inactive) {
      value = new ActiveSource(value.source, State.Inactive);
    }

    for (const effect of tr.effects) {
      if (effect.is(startCompletionEffect)) {
        value = new ActiveSource(
          value.source,
          State.Pending,
          effect.value ? cur(tr.state) : -1,
        );
      } else if (effect.is(closeCompletionEffect)) {
        value = new ActiveSource(value.source, State.Inactive);
      } else if (effect.is(setActiveEffect)) {
        for (const active of effect.value) {
          if (active.source === value.source) {
            value = active;
          }
        }
      }
    }
    return value;
  }

  handleUserEvent(
    tr: Transaction,
    type: 'input' | 'delete',
    conf: Required<CompletionConfig>,
  ): ActiveSource {
    return type === 'delete' || !conf.activateOnTyping
      ? this.map(tr.changes)
      : new ActiveSource(this.source, State.Pending);
  }

  handleChange(tr: Transaction): ActiveSource {
    return tr.changes.touchesRange(cur(tr.startState))
      ? new ActiveSource(this.source, State.Inactive)
      : this.map(tr.changes);
  }

  map(changes: ChangeDesc) {
    return changes.empty || this.explicitPos < 0
      ? this
      : new ActiveSource(this.source, this.state, changes.mapPos(this.explicitPos));
  }
}

export class ActiveResult extends ActiveSource {
  constructor(
    source: CompletionSource,
    explicitPos: number,
    readonly result: CompletionResult,
    readonly from: number,
    readonly to: number,
  ) {
    super(source, State.Result, explicitPos);
  }

  override hasResult(): this is ActiveResult {
    return true;
  }

  override handleUserEvent(
    tr: Transaction,
    type: 'input' | 'delete',
    conf: Required<CompletionConfig>,
  ): ActiveSource {
    const from = tr.changes.mapPos(this.from),
      to = tr.changes.mapPos(this.to, 1);
    const pos = cur(tr.state);
    if (
      (this.explicitPos < 0 ? pos <= from : pos < this.from) ||
      pos > to ||
      (type === 'delete' && cur(tr.startState) === this.from)
    ) {
      return new ActiveSource(
        this.source,
        type === 'input' && conf.activateOnTyping ? State.Pending : State.Inactive,
      );
    }
    const explicitPos = this.explicitPos < 0 ? -1 : tr.changes.mapPos(this.explicitPos);
    let updated;
    if (checkValid(this.result.validFor, tr.state, from, to)) {
      return new ActiveResult(this.source, explicitPos, this.result, from, to);
    }
    if (
      this.result.update &&
      (updated = this.result.update(
        this.result,
        from,
        to,
        new CompletionContext(tr.state, pos, explicitPos >= 0),
      ))
    ) {
      return new ActiveResult(
        this.source,
        explicitPos,
        updated,
        updated.from,
        updated.to ?? cur(tr.state),
      );
    }
    return new ActiveSource(this.source, State.Pending, explicitPos);
  }

  override handleChange(tr: Transaction): ActiveSource {
    return tr.changes.touchesRange(this.from, this.to)
      ? new ActiveSource(this.source, State.Inactive)
      : this.map(tr.changes);
  }

  override map(mapping: ChangeDesc) {
    return mapping.empty
      ? this
      : new ActiveResult(
          this.source,
          this.explicitPos < 0 ? -1 : mapping.mapPos(this.explicitPos),
          this.result,
          mapping.mapPos(this.from),
          mapping.mapPos(this.to, 1),
        );
  }
}

function checkValid(
  validFor:
    | undefined
    | RegExp
    | ((text: string, from: number, to: number, state: EditorState) => boolean),
  state: EditorState,
  from: number,
  to: number,
) {
  if (!validFor) {
    return false;
  }
  const text = state.sliceDoc(from, to);
  return typeof validFor === 'function'
    ? validFor(text, from, to, state)
    : ensureAnchor(validFor, true).test(text);
}

export const startCompletionEffect = StateEffect.define<boolean>();
export const closeCompletionEffect = StateEffect.define<null>();
export const setActiveEffect = StateEffect.define<readonly ActiveSource[]>({
  map(sources, mapping) {
    return sources.map((s) => s.map(mapping));
  },
});
export const setSelectedEffect = StateEffect.define<number>();

export const completionState = StateField.define<CompletionState>({
  create() {
    return CompletionState.start();
  },

  update(value, tr) {
    return value.update(tr);
  },

  provide: (f) => [
    showTooltip.from(f, (val) => val.tooltip),
    EditorView.contentAttributes.from(f, (state) => state.attrs),
  ],
});
