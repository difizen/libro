/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prefer-const */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-parameter-properties */
/* eslint-disable @typescript-eslint/parameter-properties */
import { indentUnit } from '@codemirror/language';
import type {
  ChangeDesc,
  EditorState,
  Transaction,
  TransactionSpec,
  StateCommand,
} from '@codemirror/state';
import {
  StateField,
  StateEffect,
  EditorSelection,
  Text,
  Prec,
  Facet,
  MapMode,
} from '@codemirror/state';
import type { DecorationSet, KeyBinding } from '@codemirror/view';
import { Decoration, WidgetType, EditorView, keymap } from '@codemirror/view';

import type { Completion } from './completion.js';
import { baseTheme } from './theme.js';

class FieldPos {
  constructor(
    public field: number,
    readonly line: number,
    public from: number,
    public to: number,
  ) {}
}

class FieldRange {
  constructor(
    readonly field: number,
    readonly from: number,
    readonly to: number,
  ) {}

  map(changes: ChangeDesc) {
    const from = changes.mapPos(this.from, -1, MapMode.TrackDel);
    const to = changes.mapPos(this.to, 1, MapMode.TrackDel);
    return from === null || to === null ? null : new FieldRange(this.field, from, to);
  }
}

class Snippet {
  constructor(
    readonly lines: readonly string[],
    readonly fieldPositions: readonly FieldPos[],
  ) {}

  instantiate(state: EditorState, pos: number) {
    const text = [],
      lineStart = [pos];
    const lineObj = state.doc.lineAt(pos),
      baseIndent = /^\s*/.exec(lineObj.text)![0];
    for (let line of this.lines) {
      if (text.length) {
        let indent = baseIndent,
          tabs = /^\t*/.exec(line)![0].length;
        for (let i = 0; i < tabs; i++) {
          indent += state.facet(indentUnit);
        }
        lineStart.push(pos + indent.length - tabs);
        line = indent + line.slice(tabs);
      }
      text.push(line);
      pos += line.length + 1;
    }
    const ranges = this.fieldPositions.map(
      (pos) =>
        new FieldRange(
          pos.field,
          lineStart[pos.line] + pos.from,
          lineStart[pos.line] + pos.to,
        ),
    );
    return { text, ranges };
  }

  static parse(template: string) {
    const fields: { seq: number | null; name: string }[] = [];
    let lines = [],
      positions = [],
      m;
    for (let line of template.split(/\r\n?|\n/)) {
      while ((m = /[#$]\{(?:(\d+)(?::([^}]*))?|([^}]*))\}/.exec(line))) {
        let seq = m[1] ? +m[1] : null,
          name = m[2] || m[3] || '',
          found = -1;
        for (let i = 0; i < fields.length; i++) {
          if (
            seq !== null
              ? fields[i].seq === seq
              : name
              ? fields[i].name === name
              : false
          ) {
            found = i;
          }
        }
        if (found < 0) {
          let i = 0;
          while (
            i < fields.length &&
            (seq === null || (fields[i].seq !== null && fields[i].seq! < seq))
          ) {
            i++;
          }
          fields.splice(i, 0, { seq, name });
          found = i;
          for (const pos of positions) {
            if (pos.field >= found) {
              pos.field++;
            }
          }
        }
        positions.push(
          new FieldPos(found, lines.length, m.index, m.index + name.length),
        );
        line = line.slice(0, m.index) + name + line.slice(m.index + m[0].length);
      }
      for (let esc; (esc = /([$#])\\{/.exec(line)); ) {
        line =
          line.slice(0, esc.index) +
          esc[1] +
          '{' +
          line.slice(esc.index + esc[0].length);
        for (const pos of positions) {
          if (pos.line === lines.length && pos.from > esc.index) {
            pos.from--;
            pos.to--;
          }
        }
      }
      lines.push(line);
    }
    return new Snippet(lines, positions);
  }
}

const fieldMarker = Decoration.widget({
  widget: new (class extends WidgetType {
    toDOM() {
      const span = document.createElement('span');
      span.className = 'cm-snippetFieldPosition';
      return span;
    }
    override ignoreEvent() {
      return false;
    }
  })(),
});
const fieldRange = Decoration.mark({ class: 'cm-snippetField' });

class ActiveSnippet {
  deco: DecorationSet;

  constructor(
    readonly ranges: readonly FieldRange[],
    readonly active: number,
  ) {
    this.deco = Decoration.set(
      ranges.map((r) =>
        (r.from === r.to ? fieldMarker : fieldRange).range(r.from, r.to),
      ),
    );
  }

  map(changes: ChangeDesc) {
    const ranges = [];
    for (const r of this.ranges) {
      const mapped = r.map(changes);
      if (!mapped) {
        return null;
      }
      ranges.push(mapped);
    }
    return new ActiveSnippet(ranges, this.active);
  }

  selectionInsideField(sel: EditorSelection) {
    return sel.ranges.every((range) =>
      this.ranges.some(
        (r) => r.field === this.active && r.from <= range.from && r.to >= range.to,
      ),
    );
  }
}

const setActive = StateEffect.define<ActiveSnippet | null>({
  map(value, changes) {
    return value && value.map(changes);
  },
});

const moveToField = StateEffect.define<number>();

const snippetState = StateField.define<ActiveSnippet | null>({
  create() {
    return null;
  },

  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setActive)) {
        return effect.value;
      }
      if (effect.is(moveToField) && value) {
        return new ActiveSnippet(value.ranges, effect.value);
      }
    }
    if (value && tr.docChanged) {
      value = value.map(tr.changes);
    }
    if (value && tr.selection && !value.selectionInsideField(tr.selection)) {
      value = null;
    }
    return value;
  },

  provide: (f) =>
    EditorView.decorations.from(f, (val) => (val ? val.deco : Decoration.none)),
});

function fieldSelection(ranges: readonly FieldRange[], field: number) {
  return EditorSelection.create(
    ranges
      .filter((r) => r.field === field)
      .map((r) => EditorSelection.range(r.from, r.to)),
  );
}

/// Convert a snippet template to a function that can
/// [apply](#autocomplete.Completion.apply) it. Snippets are written
/// using syntax like this:
///
///     "for (let ${index} = 0; ${index} < ${end}; ${index}++) {\n\t${}\n}"
///
/// Each `${}` placeholder (you may also use `#{}`) indicates a field
/// that the user can fill in. Its name, if any, will be the default
/// content for the field.
///
/// When the snippet is activated by calling the returned function,
/// the code is inserted at the given position. Newlines in the
/// template are indented by the indentation of the start line, plus
/// one [indent unit](#language.indentUnit) per tab character after
/// the newline.
///
/// On activation, (all instances of) the first field are selected.
/// The user can move between fields with Tab and Shift-Tab as long as
/// the fields are active. Moving to the last field or moving the
/// cursor out of the current field deactivates the fields.
///
/// The order of fields defaults to textual order, but you can add
/// numbers to placeholders (`${1}` or `${1:defaultText}`) to provide
/// a custom order.
///
/// To include a literal `${` or `#{` in your template, put a
/// backslash after the dollar or hash and before the brace (`$\\{`).
/// This will be removed and the sequence will not be interpreted as a
/// placeholder.
export function snippet(template: string) {
  const snippet = Snippet.parse(template);
  return (
    editor: { state: EditorState; dispatch: (tr: Transaction) => void },
    _completion: Completion,
    from: number,
    to: number,
  ) => {
    const { text, ranges } = snippet.instantiate(editor.state, from);
    const spec: TransactionSpec = {
      changes: { from, to, insert: Text.of(text) },
      scrollIntoView: true,
    };
    if (ranges.length) {
      spec.selection = fieldSelection(ranges, 0);
    }
    if (ranges.length > 1) {
      const active = new ActiveSnippet(ranges, 0);
      const effects: StateEffect<unknown>[] = (spec.effects = [setActive.of(active)]);
      if (editor.state.field(snippetState, false) === undefined) {
        effects.push(
          StateEffect.appendConfig.of([
            snippetState,
            addSnippetKeymap,
            snippetPointerHandler,
            baseTheme,
          ]),
        );
      }
    }
    editor.dispatch(editor.state.update(spec));
  };
}

function moveField(dir: 1 | -1): StateCommand {
  return ({ state, dispatch }) => {
    const active = state.field(snippetState, false);
    if (!active || (dir < 0 && active.active === 0)) {
      return false;
    }
    const next = active.active + dir,
      last = dir > 0 && !active.ranges.some((r) => r.field === next + dir);
    dispatch(
      state.update({
        selection: fieldSelection(active.ranges, next),
        effects: setActive.of(last ? null : new ActiveSnippet(active.ranges, next)),
      }),
    );
    return true;
  };
}

/// A command that clears the active snippet, if any.
export const clearSnippet: StateCommand = ({ state, dispatch }) => {
  const active = state.field(snippetState, false);
  if (!active) {
    return false;
  }
  dispatch(state.update({ effects: setActive.of(null) }));
  return true;
};

/// Move to the next snippet field, if available.
export const nextSnippetField = moveField(1);

/// Move to the previous snippet field, if available.
export const prevSnippetField = moveField(-1);

const defaultSnippetKeymap = [
  { key: 'Tab', run: nextSnippetField, shift: prevSnippetField },
  { key: 'Escape', run: clearSnippet },
];

/// A facet that can be used to configure the key bindings used by
/// snippets. The default binds Tab to
/// [`nextSnippetField`](#autocomplete.nextSnippetField), Shift-Tab to
/// [`prevSnippetField`](#autocomplete.prevSnippetField), and Escape
/// to [`clearSnippet`](#autocomplete.clearSnippet).
export const snippetKeymap = Facet.define<readonly KeyBinding[], readonly KeyBinding[]>(
  {
    combine(maps) {
      return maps.length ? maps[0] : defaultSnippetKeymap;
    },
  },
);

const addSnippetKeymap = Prec.highest(
  keymap.compute([snippetKeymap], (state) => state.facet(snippetKeymap)),
);

/// Create a completion from a snippet. Returns an object with the
/// properties from `completion`, plus an `apply` function that
/// applies the snippet.
export function snippetCompletion(
  template: string,
  completion: Completion,
): Completion {
  return { ...completion, apply: snippet(template) };
}

const snippetPointerHandler = EditorView.domEventHandlers({
  mousedown(event, view) {
    let active = view.state.field(snippetState, false),
      pos: number | null;
    if (
      !active ||
      (pos = view.posAtCoords({ x: event.clientX, y: event.clientY })) === null
    ) {
      return false;
    }
    const match = active.ranges.find((r) => r.from <= pos! && r.to >= pos!);
    if (!match || match.field === active.active) {
      return false;
    }
    view.dispatch({
      selection: fieldSelection(active.ranges, match.field),
      effects: setActive.of(
        active.ranges.some((r) => r.field > match.field)
          ? new ActiveSnippet(active.ranges, match.field)
          : null,
      ),
    });
    return true;
  },
});
