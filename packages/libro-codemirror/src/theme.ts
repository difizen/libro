import {
  defaultHighlightStyle,
  HighlightStyle,
  syntaxHighlighting,
} from '@codemirror/language';
import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

export const jupyterEditorTheme = EditorView.theme({
  /**
   * CodeMirror themes are handling the background/color in this way. This works
   * fine for CodeMirror editors outside the notebook, but the notebook styles
   * these things differently.
   */
  '&': {
    background: 'var(--mana-libro-input-background)',
    color: 'var(--mana-libro-text-default-color)',
  },

  /* In the notebook, we want this styling to be handled by its container */
  '.jp-CodeConsole &, .jp-Notebook &': {
    background: 'transparent',
  },

  '.cm-content': {
    caretColor: 'var(--jp-editor-cursor-color)',
  },

  '.cm-cursor, .cm-dropCursor': {
    borderLeft:
      'var(--jp-code-cursor-width0) solid var(--mana-libro-editor-cursor-color)',
  },

  '.cm-selectionBackground, .cm-content ::selection': {
    color: 'unset',
    backgroundColor: 'var(--mana-libro-editor-selection-color) !important',
  },

  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'var(--mana-libro-editor-selection-color) !important',
  },

  '.cm-gutters': {
    borderRight: 'unset',
    backgroundColor: 'var(--mana-libro-input-background)',
    // paddingBottom: '15px',
    color: 'var(--mana-libro-editor-gutter-number-color)',
    fontFamily: 'var(--jp-code-font-family-default)',
    fontWeight: '400',
    fontSize: '13px',
    lineHeight: '20px',
  },

  '.cm-foldGutter .cm-gutterElement': {
    width: '20px',
    paddingRight: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  '.cm-line': {
    paddingLeft: '1px',
  },

  '.cm-activeLineGutter': {
    backgroundColor: 'var(--mana-libro-editor-activeline-color) !important',
  },

  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 0 0 16px',
    minWidth: '32px',
  },

  'cm-selectionMatch': {
    backgroundColor: 'var(--mana-libro-editor-selectionMatch-color)',
  },

  '.cm-activeLine': {
    backgroundColor: 'var(--mana-libro-editor-activeline-color)',
  },

  '.cm-scroller': {
    fontFamily: 'var(--jp-code-font-family-default)',
    fontWeight: '400',
    fontSize: '13px',
    letterSpacing: '0',
    lineHeight: '20px',
  },

  '.cm-editor': {
    background: 'var(--mana-libro-input-background)',
  },

  '.cm-searchMatch': {
    backgroundColor: 'var(--jp-search-unselected-match-background-color)',
    color: 'var(--jp-search-unselected-match-color)',
  },

  '.cm-searchMatch span': {
    backgroundColor: 'var(--jp-search-unselected-match-background-color)',
    color: 'var(--jp-search-unselected-match-color)',
  },

  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'var(--jp-search-selected-match-background-color) !important',
    color: 'var(--jp-search-selected-match-color) !important',
  },

  '.cm-searchMatch.cm-searchMatch-selected span': {
    backgroundColor: 'var(--jp-search-selected-match-background-color) !important',
    color: 'var(--jp-search-selected-match-color) !important',
  },

  // '.cm-content, .cm-gutter': { minHeight: '30px' },
});

export const jupyterHighlightStyle = HighlightStyle.define([
  // Order matters - a rule will override the previous ones; important for example for in headings styles.
  { tag: t.meta, color: 'var(--jp-mirror-editor-meta-color)' },
  { tag: t.heading, color: 'var(--jp-mirror-editor-header-color)' },
  {
    tag: [t.heading1, t.heading2, t.heading3, t.heading4],
    color: 'var(--jp-mirror-editor-header-color)',
    fontWeight: 'bold',
  },
  {
    tag: t.keyword,
    color: 'var(--mana-libro-editor-keyword-color)',
    fontWeight: 'bold',
  },
  { tag: t.atom, color: 'var(--mana-libro-editor-atom-color)' },
  { tag: t.number, color: 'var(--mana-libro-editor-number-color)' },
  {
    tag: [t.definition(t.name), t.function(t.definition(t.variableName))],
    color: 'var(--mana-libro-editor-def-color)',
  },
  { tag: t.variableName, color: 'var(--mana-libro-editor-variable-color)' },
  {
    tag: [t.special(t.variableName), t.self],
    color: 'var(--mana-libro-editor-variable-2-color)',
  },
  { tag: t.punctuation, color: 'var(--mana-libro-editor-punctuation-color)' },
  { tag: t.propertyName, color: 'var(--mana-libro-editor-property-color)' },
  {
    tag: t.operator,
    color: 'var(--mana-libro-editor-operator-color)',
    fontWeight: 'bold',
  },
  {
    tag: t.comment,
    color: 'var(--mana-libro-editor-comment-color)',
    fontStyle: 'italic',
  },
  { tag: t.string, color: 'var(--mana-libro-editor-string-color)' },
  {
    tag: [t.labelName, t.monospace, t.special(t.string)],
    color: 'var(--jp-mirror-editor-string-2-color)',
  },
  { tag: t.bracket, color: 'var(--jp-mirror-editor-bracket-color)' },
  { tag: t.tagName, color: 'var(--jp-mirror-editor-tag-color)' },
  { tag: t.attributeName, color: 'var(--jp-mirror-editor-attribute-color)' },
  { tag: t.quote, color: 'var(--jp-mirror-editor-quote-color)' },
  {
    tag: t.link,
    color: 'var(--jp-mirror-editor-link-color)',
    textDecoration: 'underline',
  },
  { tag: [t.separator, t.derefOperator, t.paren], color: '' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
]);

/**
 * JupyterLab CodeMirror 6 theme
 */
export const jupyterTheme: Extension = [
  jupyterEditorTheme,
  syntaxHighlighting(jupyterHighlightStyle),
];

/**
 * A namespace to handle CodeMirror 6 theme
 *
 * @alpha
 */
/**
 * CodeMirror 6 themes
 */
const themeMap: Map<string, Extension> = new Map([
  ['codemirror', [EditorView.baseTheme({}), syntaxHighlighting(defaultHighlightStyle)]],
  ['jupyter', jupyterTheme],
]);

/**
 * Get the default CodeMirror 6 theme for JupyterLab
 *
 * @alpha
 * @returns Default theme
 */
export function defaultTheme(): Extension {
  return themeMap.get('jupyter')!;
}

/**
 * Register a new theme.
 *
 * @alpha
 * @param name Theme name
 * @param theme Codemirror 6 theme extension
 */
export function registerTheme(name: string, theme: Extension) {
  themeMap.set(name, theme);
}

/**
 * Get a theme.
 *
 * #### Notes
 * It falls back to the default theme
 *
 * @alpha
 * @param name Theme name
 * @returns Theme extension
 */
export function getTheme(name: string): Extension {
  const ext = themeMap.get(name);

  return ext ?? defaultTheme();
}
