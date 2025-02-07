import { EditorView, hasHoverTooltips } from '@codemirror/view';
import { Emitter } from '@difizen/libro-common/app';

import {
  closeCompletionEffect,
  setSelectedEffect,
  startCompletionEffect,
} from './auto-complete/state.js';

interface DocStatus {
  source: string[];
  cursor: number;
  changes?: string;
}

interface CompletionChange {
  start?: DocStatus;
  accept?: DocStatus;
  close?: DocStatus;
  selectIndex?: number;
}

export class CompletionMonitor {
  protected static instance: CompletionMonitor;

  static getInstance() {
    if (!CompletionMonitor.instance) {
      CompletionMonitor.instance = new CompletionMonitor();
    }
    return CompletionMonitor.instance;
  }

  protected completionChangeEmitter: Emitter<CompletionChange> = new Emitter();

  get compeltionChange() {
    return this.completionChangeEmitter.event;
  }

  protected tooltipChangeEmitter: Emitter<boolean> = new Emitter();

  get onTooltipChange() {
    return this.tooltipChangeEmitter.event;
  }

  protected currentChange: CompletionChange | undefined;

  start(doc: DocStatus) {
    this.currentChange = { start: doc, selectIndex: 0 };
  }

  accept(doc: DocStatus) {
    this.currentChange = { ...this.currentChange, ...{ accept: doc } };
    this.emitChange(this.currentChange);
  }

  close(doc: DocStatus) {
    this.currentChange = { ...this.currentChange, ...{ close: doc, selectIndex: -1 } };
    this.emitChange(this.currentChange);
  }

  updateIndex(index: number) {
    this.currentChange = { ...this.currentChange, ...{ selectIndex: index } };
  }

  emitChange(change: CompletionChange) {
    this.completionChangeEmitter.fire(change);
  }
}

export interface MonitorPluginOptions {
  onTooltipChange?: (visible: boolean) => void;
}

export const monitorPlugin = (options: MonitorPluginOptions) =>
  EditorView.updateListener.of((update) => {
    for (const trans of update.transactions) {
      const { effects } = trans;

      options?.onTooltipChange?.(hasHoverTooltips(update.state));

      if (trans.isUserEvent('input.complete')) {
        CompletionMonitor.getInstance().accept({
          changes: JSON.stringify(trans.changes.toJSON()),
          cursor: update.state.selection.main.head,
          source: update.state.doc.toJSON(),
        });
      }
      for (const effect of effects) {
        if (effect.is(startCompletionEffect)) {
          CompletionMonitor.getInstance().start({
            cursor: update.state.selection.main.head,
            source: update.state.doc.toJSON(),
          });
        } else if (effect.is(closeCompletionEffect)) {
          CompletionMonitor.getInstance().close({
            cursor: update.state.selection.main.head,
            source: update.state.doc.toJSON(),
          });
        } else if (effect.is(setSelectedEffect)) {
          CompletionMonitor.getInstance().updateIndex(effect.value);
        }
      }
    }
    return null;
  });
