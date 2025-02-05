import type { Transaction } from '@codemirror/state';
import type {
  EditorView,
  Command,
  PluginValue,
  ViewUpdate,
  TooltipView,
} from '@codemirror/view';
import { ViewPlugin, logException, getTooltip } from '@codemirror/view';

import type { CompletionResult } from './completion.js';
import { cur, CodemirrorCompletionContext, applyCompletion } from './completion.js';
import { completionConfig } from './config.js';
import {
  completionState,
  setSelectedEffect,
  startCompletionEffect,
  closeCompletionEffect,
  setActiveEffect,
  State,
  ActiveSource,
  ActiveResult,
  getUserEvent,
} from './state.js';

/// Returns a command that moves the completion selection forward or
/// backward by the given amount.
export function moveCompletionSelection(
  forward: boolean,
  by: 'option' | 'page' = 'option',
): Command {
  return (view: EditorView) => {
    const cState = view.state.field(completionState, false);
    if (
      !cState ||
      !cState.open ||
      Date.now() - cState.open.timestamp <
        view.state.facet(completionConfig).interactionDelay
    ) {
      return false;
    }
    let step = 1,
      tooltip: TooltipView | null;
    if (by === 'page' && (tooltip = getTooltip(view, cState.open.tooltip))) {
      step = Math.max(
        2,
        Math.floor(
          tooltip.dom.offsetHeight /
            (tooltip.dom.querySelector('li') as HTMLElement).offsetHeight,
        ) - 1,
      );
    }
    const { length } = cState.open.options;
    let selected =
      cState.open.selected > -1
        ? cState.open.selected + step * (forward ? 1 : -1)
        : forward
          ? 0
          : length - 1;
    if (selected < 0) {
      selected = by === 'page' ? 0 : length - 1;
    } else if (selected >= length) {
      selected = by === 'page' ? length - 1 : 0;
    }
    view.dispatch({ effects: setSelectedEffect.of(selected) });
    return true;
  };
}

/// Accept the current completion.
export const acceptCompletion: Command = (view: EditorView) => {
  const cState = view.state.field(completionState, false);
  if (
    view.state.readOnly ||
    !cState ||
    !cState.open ||
    cState.open.selected < 0 ||
    Date.now() - cState.open.timestamp <
      view.state.facet(completionConfig).interactionDelay
  ) {
    return false;
  }
  applyCompletion(view, cState.open.options[cState.open.selected]);
  return true;
};

/// Explicitly start autocompletion.
export const startCompletion: Command = (view: EditorView) => {
  const cState = view.state.field(completionState, false);
  if (!cState) {
    return false;
  }
  view.dispatch({ effects: startCompletionEffect.of(true) });
  return true;
};

/// Close the currently active completion.
export const closeCompletion: Command = (view: EditorView) => {
  const cState = view.state.field(completionState, false);
  if (!cState || !cState.active.some((a) => a.state !== State.Inactive)) {
    return false;
  }
  view.dispatch({ effects: closeCompletionEffect.of(null) });
  return true;
};

class RunningQuery {
  time = Date.now();
  updates: Transaction[] = [];
  // Note that 'undefined' means 'not done yet', whereas 'null' means
  // 'query returned null'.
  done: undefined | CompletionResult | null = undefined;

  constructor(
    readonly active: ActiveSource,
    readonly context: CodemirrorCompletionContext,
  ) {}
}

const DebounceTime = 50,
  MaxUpdateCount = 50,
  MinAbortTime = 1000;

const enum CompositionState {
  None,
  Started,
  Changed,
  ChangedAndMoved,
}

export const completionPlugin = ViewPlugin.fromClass(
  class implements PluginValue {
    debounceUpdate: NodeJS.Timeout | -1 = -1;
    running: RunningQuery[] = [];
    debounceAccept: NodeJS.Timeout | -1 = -1;
    composing = CompositionState.None;

    constructor(readonly view: EditorView) {
      for (const active of view.state.field(completionState).active) {
        if (active.state === State.Pending) {
          this.startQuery(active);
        }
      }
    }

    update(update: ViewUpdate) {
      const cState = update.state.field(completionState);
      if (
        !update.selectionSet &&
        !update.docChanged &&
        update.startState.field(completionState) === cState
      ) {
        return;
      }

      const doesReset = update.transactions.some((tr) => {
        return (tr.selection || tr.docChanged) && !getUserEvent(tr);
      });
      for (let i = 0; i < this.running.length; i++) {
        const query = this.running[i];
        if (
          doesReset ||
          (query.updates.length + update.transactions.length > MaxUpdateCount &&
            Date.now() - query.time > MinAbortTime)
        ) {
          for (const handler of query.context.abortListeners!) {
            try {
              handler();
            } catch (e) {
              logException(this.view.state, e);
            }
          }
          query.context.abortListeners = null;
          this.running.splice(i--, 1);
        } else {
          query.updates.push(...update.transactions);
        }
      }

      if (this.debounceUpdate > -1) {
        clearTimeout(this.debounceUpdate);
      }
      this.debounceUpdate = cState.active.some(
        (a) =>
          a.state === State.Pending &&
          !this.running.some((q) => q.active.source === a.source),
      )
        ? setTimeout(() => this.startUpdate(), DebounceTime)
        : -1;

      if (this.composing !== CompositionState.None) {
        for (const tr of update.transactions) {
          if (getUserEvent(tr) === 'input') {
            this.composing = CompositionState.Changed;
          } else if (this.composing === CompositionState.Changed && tr.selection) {
            this.composing = CompositionState.ChangedAndMoved;
          }
        }
      }
    }

    startUpdate() {
      this.debounceUpdate = -1;
      const { state } = this.view,
        cState = state.field(completionState);
      for (const active of cState.active) {
        if (
          active.state === State.Pending &&
          !this.running.some((r) => r.active.source === active.source)
        ) {
          this.startQuery(active);
        }
      }
    }

    startQuery(active: ActiveSource) {
      const { state } = this.view,
        pos = cur(state);
      const context = new CodemirrorCompletionContext(
        state,
        pos,
        active.explicitPos === pos,
      );
      const pending = new RunningQuery(active, context);
      this.running.push(pending);
      Promise.resolve(active.source(context))
        .then(
          (result) => {
            if (!pending.context.aborted) {
              pending.done = result || null;
              return this.scheduleAccept();
            }
            return undefined;
          },
          (err) => {
            this.view.dispatch({ effects: closeCompletionEffect.of(null) });
            logException(this.view.state, err);
            return undefined;
          },
        )
        .catch(console.error);
    }

    scheduleAccept() {
      if (this.running.every((q) => q.done !== undefined)) {
        this.accept();
      } else if (this.debounceAccept < 0) {
        this.debounceAccept = setTimeout(() => this.accept(), DebounceTime);
      }
    }

    // For each finished query in this.running, try to create a result
    // or, if appropriate, restart the query.
    accept() {
      if (this.debounceAccept > -1) {
        clearTimeout(this.debounceAccept);
      }
      this.debounceAccept = -1;

      const updated: ActiveSource[] = [];
      const conf = this.view.state.facet(completionConfig);
      for (let i = 0; i < this.running.length; i++) {
        const query = this.running[i];
        if (query.done === undefined) {
          continue;
        }
        this.running.splice(i--, 1);

        if (query.done) {
          let active: ActiveSource = new ActiveResult(
            query.active.source,
            query.active.explicitPos,
            query.done,
            query.done.from,
            query.done.to ??
              cur(query.updates.length ? query.updates[0].startState : this.view.state),
          );
          // Replay the transactions that happened since the start of
          // the request and see if that preserves the result
          for (const tr of query.updates) {
            active = active.update(tr, conf);
          }
          if (active.hasResult()) {
            updated.push(active);
            continue;
          }
        }

        const current = this.view.state
          .field(completionState)
          .active.find((a) => a.source === query.active.source);
        if (current && current.state === State.Pending) {
          if (query.done === null) {
            // Explicitly failed. Should clear the pending status if it
            // hasn't been re-set in the meantime.
            let active = new ActiveSource(query.active.source, State.Inactive);
            for (const tr of query.updates) {
              active = active.update(tr, conf);
            }
            if (active.state !== State.Pending) {
              updated.push(active);
            }
          } else {
            // Cleared by subsequent transactions. Restart.
            this.startQuery(current);
          }
        }
      }

      if (updated.length) {
        this.view.dispatch({ effects: setActiveEffect.of(updated) });
      }
    }
  },
  {
    eventHandlers: {
      blur() {
        const state = this.view.state.field(completionState, false);
        if (
          state &&
          state.tooltip &&
          this.view.state.facet(completionConfig).closeOnBlur
        ) {
          this.view.dispatch({ effects: closeCompletionEffect.of(null) });
        }
      },
      compositionstart() {
        this.composing = CompositionState.Started;
      },
      compositionend() {
        if (this.composing === CompositionState.ChangedAndMoved) {
          // Safari fires compositionend events synchronously, possibly
          // from inside an update, so dispatch asynchronously to avoid reentrancy
          setTimeout(
            () => this.view.dispatch({ effects: startCompletionEffect.of(false) }),
            20,
          );
        }
        this.composing = CompositionState.None;
      },
    },
  },
);
