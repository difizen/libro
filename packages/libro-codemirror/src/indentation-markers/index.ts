import { getIndentUnit } from '@codemirror/language';
import type { EditorState } from '@codemirror/state';
import { RangeSetBuilder } from '@codemirror/state';
import type { DecorationSet, ViewUpdate, PluginValue } from '@codemirror/view';
import { Decoration, ViewPlugin, EditorView } from '@codemirror/view';

import { indentationMarkerConfig } from './config.js';
import type { IndentationMarkerConfiguration } from './config.js';
import type { IndentEntry } from './map.js';
import { IndentationMap } from './map.js';
import { getCurrentLine, getVisibleLines } from './utils.js';

// CSS classes:
// - .cm-indent-markers

// CSS variables:
// - --indent-marker-bg-part
// - --indent-marker-active-bg-part

/** Color of inactive indent markers. Based on RUI's var(--background-higher) */
const MARKER_COLOR_LIGHT = '#5f6064';
const MARKER_COLOR_DARK = '#5f6064';

/** Color of active indent markers. Based on RUI's var(--background-highest) */
const MARKER_COLOR_ACTIVE_LIGHT = '#A4AECB';
const MARKER_COLOR_ACTIVE_DARK = '#565C6D';

/** Thickness of indent markers. Probably should be integer pixel values. */
const MARKER_THICKNESS = '1px';

const indentTheme = EditorView.baseTheme({
  '&light': {
    '--indent-marker-bg-color': MARKER_COLOR_LIGHT,
    '--indent-marker-active-bg-color': MARKER_COLOR_ACTIVE_LIGHT,
  },

  '&dark': {
    '--indent-marker-bg-color': MARKER_COLOR_DARK,
    '--indent-marker-active-bg-color': MARKER_COLOR_ACTIVE_DARK,
  },

  '.cm-line': {
    position: 'relative',
  },

  // this pseudo-element is used to draw the indent markers,
  // while still allowing the line to have its own background.
  '.cm-indent-markers::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--indent-markers)',
    pointerEvents: 'none',
    zIndex: '-1',
  },
});

function createGradient(
  markerCssProperty: string,
  indentWidth: number,
  startOffset: number,
  columns: number,
) {
  const gradient = `repeating-linear-gradient(to right, var(${markerCssProperty}) 0 ${MARKER_THICKNESS}, transparent ${MARKER_THICKNESS} ${indentWidth}ch)`;
  // Subtract one pixel from the background width to get rid of artifacts of pixel rounding
  return `${gradient} ${startOffset * indentWidth}ch/calc(${
    indentWidth * columns
  }ch - 1px) no-repeat`;
}

// libro 没有使用codemirror的dark theme机制
// const indentMarkerBgColor = '--indent-marker-bg-color';
// const indentMarkerActiveBgColor = '--indent-marker-active-bg-color';
const indentMarkerBgColor = '--mana-libro-editor-indent-marker-bg-color';
const indentMarkerActiveBgColor = '--mana-libro-editor-indent-marker-active-bg-color';

function makeBackgroundCSS(
  entry: IndentEntry,
  indentWidth: number,
  hideFirstIndent: boolean,
) {
  const { level, active } = entry;
  if (hideFirstIndent && level === 0) {
    return [];
  }
  const startAt = hideFirstIndent ? 1 : 0;
  const backgrounds = [];

  if (active !== undefined) {
    const markersBeforeActive = active - startAt - 1;
    if (markersBeforeActive > 0) {
      backgrounds.push(
        createGradient(indentMarkerBgColor, indentWidth, startAt, markersBeforeActive),
      );
    }
    backgrounds.push(
      createGradient(indentMarkerActiveBgColor, indentWidth, active - 1, 1),
    );
    if (active !== level) {
      backgrounds.push(
        createGradient(indentMarkerBgColor, indentWidth, active, level - active),
      );
    }
  } else {
    backgrounds.push(
      createGradient(indentMarkerBgColor, indentWidth, startAt, level - startAt),
    );
  }

  return backgrounds.join(',');
}

class IndentMarkersClass implements PluginValue {
  view: EditorView;
  decorations!: DecorationSet;

  private unitWidth: number;
  private currentLineNumber: number;

  constructor(view: EditorView) {
    this.view = view;
    this.unitWidth = getIndentUnit(view.state);
    this.currentLineNumber = getCurrentLine(view.state).number;
    this.generate(view.state);
  }

  update(update: ViewUpdate) {
    const unitWidth = getIndentUnit(update.state);
    const unitWidthChanged = unitWidth !== this.unitWidth;
    if (unitWidthChanged) {
      this.unitWidth = unitWidth;
    }
    const lineNumber = getCurrentLine(update.state).number;
    const lineNumberChanged = lineNumber !== this.currentLineNumber;
    this.currentLineNumber = lineNumber;
    const activeBlockUpdateRequired =
      update.state.facet(indentationMarkerConfig).highlightActiveBlock &&
      lineNumberChanged;
    if (
      update.docChanged ||
      update.viewportChanged ||
      unitWidthChanged ||
      activeBlockUpdateRequired
    ) {
      this.generate(update.state);
    }
  }

  private generate(state: EditorState) {
    const builder = new RangeSetBuilder<Decoration>();

    const lines = getVisibleLines(this.view, state);
    const { hideFirstIndent, markerType } = state.facet(indentationMarkerConfig);
    const map = new IndentationMap(lines, state, this.unitWidth, markerType);

    for (const line of lines) {
      const entry = map.get(line.number);

      if (!entry?.level) {
        continue;
      }

      const backgrounds = makeBackgroundCSS(entry, this.unitWidth, hideFirstIndent);

      builder.add(
        line.from,
        line.from,
        Decoration.line({
          class: 'cm-indent-markers',
          attributes: {
            style: `--indent-markers: ${backgrounds}`,
          },
        }),
      );
    }

    this.decorations = builder.finish();
  }
}

export function indentationMarkers(config: IndentationMarkerConfiguration = {}) {
  return [
    indentationMarkerConfig.of(config),
    indentTheme,
    ViewPlugin.fromClass(IndentMarkersClass, {
      decorations: (v) => v.decorations,
    }),
  ];
}
