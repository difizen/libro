/* eslint-disable @typescript-eslint/no-parameter-properties */
/* eslint-disable @typescript-eslint/parameter-properties */
import { StateEffect, StateField } from '@codemirror/state';
import type { EditorState } from '@codemirror/state';
import type {
  Command,
  KeyBinding,
  PluginValue,
  Tooltip,
  ViewUpdate,
} from '@codemirror/view';
import { ViewPlugin, showTooltip, EditorView } from '@codemirror/view';
import type { TooltipProvider } from '@difizen/libro-code-editor';
import { defaultSanitizer } from '@difizen/libro-common';
import { renderText } from '@difizen/libro-rendermime';

export const startTooltipEffect = StateEffect.define<boolean>();
export const closeTooltipEffect = StateEffect.define<null>();
const tooltipResultEffect = StateEffect.define<{ tooltipText: string | null }>({});

const getCursorTooltips = (state: EditorState, text: string): Tooltip => {
  return {
    pos: state.selection.main.head,
    above: false,
    strictSide: false,
    arrow: false,
    create: () => {
      const dom = document.createElement('div');
      dom.className = 'cm-tooltip-libro';
      renderText({
        sanitizer: defaultSanitizer,
        source: text,
        host: dom,
        mimeType: '',
      });
      return { dom };
    },
  };
};

const tooltipField = StateField.define<Tooltip | null>({
  create() {
    return null;
  },

  update(tooltips, tr) {
    const { effects } = tr;
    for (const effect of effects) {
      if (effect.is(closeTooltipEffect)) {
        return null;
      } else if (effect.is(tooltipResultEffect)) {
        const text = effect.value.tooltipText;
        if (text !== null) {
          return getCursorTooltips(tr.state, text);
        }
      }
    }
    return null;
  },

  provide: (f) =>
    showTooltip.compute([f], (state) => {
      const filed = state.field(f);
      if (filed === null) {
        return null;
      }
      return filed;
    }),
});

/// Explicitly start tooltip.
export const startTooltip: Command = (view: EditorView) => {
  view.dispatch({ effects: startTooltipEffect.of(true) });
  return true;
};

/// Close tooltip.
export const closeTooltip: Command = (view: EditorView) => {
  view.dispatch({ effects: closeTooltipEffect.of(null) });
  return true;
};

export const tooltipKeymap: readonly KeyBinding[] = [
  { key: 'Shift-Tab', run: startTooltip },
  { key: 'Escape', run: closeTooltip },
];

const cursorTooltipBaseTheme = EditorView.baseTheme({
  '.cm-tooltip.cm-tooltip-libro': {
    zIndex: '10001',
    color: 'rgba(0,0,0,0.87)',
    padding: '2px 7px',
    borderRadius: '4px',
    boxShadow:
      'rgba(0,0,0,0.2) 0px 3px 5px -1px, rgba(0,0,0,0.0.14) 0px 6px 10px 0px, rgba(0,0,0,0.0.12) 0px 1px 18px 0px',
    maxHeight: '350px',
    overflow: 'auto',
  },
});

class TooltipPlugin implements PluginValue {
  constructor(
    readonly view: EditorView,
    readonly tooltipProvider: TooltipProvider | undefined,
  ) {}

  update(update: ViewUpdate) {
    update.transactions.forEach((tr) => {
      for (const effect of tr.effects) {
        if (effect.is(startTooltipEffect) && this.tooltipProvider) {
          this.tooltipProvider({
            cursorPosition: update.view.state.selection.main.anchor,
          })
            .then((result) => {
              update.view.dispatch({
                effects: tooltipResultEffect.of({
                  tooltipText: result,
                }),
              });
              return undefined;
            })
            .catch(console.error);
        }
      }
    });
  }
}

const asyncShowTooltip = (tooltipProvider: TooltipProvider | undefined) =>
  ViewPlugin.define((view) => new TooltipPlugin(view, tooltipProvider), {
    eventHandlers: {
      blur() {
        const state = this.view.state.field(tooltipField, false);
        if (state) {
          this.view.dispatch({ effects: closeTooltipEffect.of(null) });
        }
      },
    },
  });

export function tabTooltip(tooltipProvider: TooltipProvider | undefined) {
  return [tooltipField, cursorTooltipBaseTheme, asyncShowTooltip(tooltipProvider)];
}
