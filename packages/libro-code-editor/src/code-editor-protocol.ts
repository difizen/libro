import type { JSONObject, JSONValue } from '@difizen/libro-common';
import type { Disposable, Event, ThemeType } from '@difizen/libro-common/app';
import { Syringe } from '@difizen/libro-common/app';

import type { IModel } from './code-editor-model.js';

/**
 * A one-based position in the editor.
 */
export interface IPosition extends JSONObject {
  /**
   * The cursor line number. one-based.
   */
  readonly line: number;

  /**
   * The cursor column number. one-based.
   */
  readonly column: number;
}
/**
 * An interface describing editor state coordinates.
 */
export type ICoordinate = DOMRectReadOnly;
/**
 * A range.
 */
export interface IRange {
  /**
   * The position of the first character in the current range.
   *
   * #### Notes
   * If this position is greater than [end] then the range is considered
   * to be backward.
   */
  readonly start: IPosition;

  /**
   * The position of the last character in the current range.
   *
   * #### Notes
   * If this position is less than [start] then the range is considered
   * to be backward.
   */
  readonly end: IPosition;
}

/**
 * A selection style.
 */
export interface IEditorSelectionStyle {
  /**
   * A class name added to a selection.
   */
  className: string;

  /**
   * A display name added to a selection.
   */
  displayName: string;

  /**
   * A color for UI elements.
   */
  color: string;
}

/**
 * The default selection style.
 */
export const defaultSelectionStyle: IEditorSelectionStyle = {
  className: '',
  displayName: '',
  color: 'black',
};

/**
 * A text selection.
 */
export interface ITextSelection extends IRange {
  /**
   * The uuid of the text selection owner.
   */
  readonly uuid: string;

  /**
   * The style of this selection.
   */
  readonly style: IEditorSelectionStyle;
}

/**
 * An interface for a text token, such as a word, keyword, or variable.
 */
export interface IToken {
  /**
   * The value of the token.
   */
  value: string;

  /**
   * The offset of the token in the code editor.
   */
  offset: number;

  /**
   * An optional type for the token.
   */
  type?: string;
}

/**
 * A selection owner.
 */
export interface ISelectionOwner {
  /**
   * The uuid of this selection owner.
   */
  uuid: string;

  /**
   * Return selection value, if no range, return primary position value
   */
  getSelectionValue: (range?: IRange) => string | undefined;

  /**
   * Returns the primary position of the cursor, never `null`.
   */
  getCursorPosition: () => IPosition;

  /**
   * Set the primary position of the cursor.
   *
   * @param position - The new primary position.
   *
   * #### Notes
   * This will remove any secondary cursors.
   */
  setCursorPosition: (position: IPosition) => void;

  /**
   * Returns the primary selection, never `null`.
   */
  getSelection: () => IRange;

  /**
   * Set the primary selection.
   *
   * @param selection - The desired selection range.
   *
   * #### Notes
   * This will remove any secondary cursors.
   */
  setSelection: (selection: IRange) => void;

  /**
   * Gets the selections for all the cursors, never `null` or empty.
   */
  getSelections: () => IRange[];

  /**
   * Sets the selections for all the cursors.
   *
   * @param selections - The new selections.
   *
   * #### Notes
   * Cursors will be removed or added, as necessary.
   * Passing an empty array resets a cursor position to the start of a
   * document.
   */
  setSelections: (selections: IRange[]) => void;

  /**
   * Replaces selection with the given text.
   */
  replaceSelection: (text: string, range: IRange) => void;

  /**
   * Replaces selection with the given text.
   */
  replaceSelections: (edits: { text: string; range: IRange }[]) => void;

  /**
   * highlight search matches
   * @param matches
   * @param currentIndex
   */
  highlightMatches: (matches: SearchMatch[], currentIndex: number | undefined) => void;
}

/**
 * A keydown handler type.
 *
 * #### Notes
 * Return `true` to prevent the default handling of the event by the
 * editor.
 */
export type KeydownHandler = (instance: IEditor, event: KeyboardEvent) => boolean;

/**
 * The location of requested edges.
 */
export type EdgeLocation = 'top' | 'topLine' | 'bottom';
/**
 * A widget that provides a code editor.
 */
export interface IEditor<S = any> extends ISelectionOwner, Disposable {
  editorReady: Promise<void>;
  /**
   * A signal emitted when either the top or bottom edge is requested.
   */
  // readonly edgeRequested: ISignal<IEditor, EdgeLocation>;

  // /**
  //  * The default selection style for the editor.
  //  */
  // selectionStyle: IEditorSelectionStyle;

  /**
   * The DOM node that hosts the editor.
   */
  readonly host: HTMLElement;

  /**
   * The model used by the editor.
   */
  readonly model: IModel;

  // /**
  //  * The height of a line in the editor in pixels.
  //  */
  // readonly lineHeight: number;

  // /**
  //  * The widget of a character in the editor in pixels.
  //  */
  // readonly charWidth: number;

  /**
   * Get the number of lines in the editor.
   */
  readonly lineCount: number;

  /**
   * Get a config option for the editor.
   */
  getOption: <K extends keyof IEditorConfig>(option: K) => IEditorConfig[K];

  /**
   * Set a config option for the editor.
   */
  setOption: <K extends keyof IEditorConfig>(
    option: K,
    value: IEditorConfig[K],
  ) => void;

  // /**
  //  * Set config options for the editor.
  //  */
  // setOptions: (options: Partial<IEditorConfig>) => void;

  /**
   * Returns the content for the given line number.
   *
   * @param line - The line of interest.
   *
   * @returns The value of the line.
   *
   * #### Notes
   * Lines are 1-based, and accessing a line out of range returns
   * `undefined`.
   */
  getLine: (line: number) => string | undefined;

  /**
   * Find an zero-based offset for the given position.
   *
   * @param position - The position of interest.
   *
   * @returns The offset at the position, clamped to the extent of the
   * editor contents.
   */
  getOffsetAt: (position: IPosition) => number;

  /**
   * Find a position for the given offset.
   *
   * @param offset - The offset of interest.
   *
   * @returns The position at the offset, clamped to the extent of the
   * editor contents.
   */
  getPositionAt: (offset: number) => IPosition | undefined;

  /**
   * Undo one edit (if any undo events are stored).
   */
  undo: () => void;

  /**
   * Redo one undone edit.
   */
  redo: () => void;

  // /**
  //  * Clear the undo history.
  //  */
  // clearHistory: () => void;

  /**
   * Brings browser focus to this editor text.
   */
  focus: () => void;

  /**
   * Test whether the editor has keyboard focus.
   */
  hasFocus: () => boolean;

  /**
   * Explicitly blur the editor.
   */
  blur: () => void;

  /**
   * Resize the editor to fit its host node.
   */
  resizeToFit: () => void;

  // /**
  //  * Add a keydown handler to the editor.
  //  *
  //  * @param handler - A keydown handler.
  //  *
  //  * @returns A disposable that can be used to remove the handler.
  //  */
  // addKeydownHandler: (handler: KeydownHandler) => Disposable;

  // /**
  //  * Reveals the given position in the editor.
  //  *
  //  * @param position - The desired position to reveal.
  //  */
  // revealPosition: (position: IPosition) => void;

  /**
   * Reveals the given selection in the editor.
   *
   * @param position - The desired selection to reveal.
   */
  revealSelection: (selection: IRange) => void;

  // /**
  //  * Get the window coordinates given a cursor position.
  //  *
  //  * @param position - The desired position.
  //  *
  //  * @returns The coordinates of the position.
  //  */
  // getCoordinateForPosition: (position: IPosition) => ICoordinate;

  /**
   * Get the cursor position given window coordinates.
   *
   * @param coordinate - The desired coordinate.
   *
   * @returns The position of the coordinates, or null if not
   *   contained in the editor.
   */
  getPositionForCoordinate: (coordinate: ICoordinate) => IPosition | null;

  // /**
  //  * Get a list of tokens for the current editor text content.
  //  */
  // getTokens: () => IToken[];

  // /**
  //  * Get the token at a given editor position.
  //  */
  // getTokenAt: (offset: number) => IToken;

  // /**
  //  * Get the token a the cursor position.
  //  */
  // getTokenAtCursor: () => IToken;

  // /**
  //  * Inserts a new line at the cursor position and indents it.
  //  */
  // newIndentedLine: () => void;

  onModalChange: Event<boolean>;

  dispose: () => void;

  getState: () => EditorState<S>;

  format: () => void;

  onModelContentChanged?: Event<IModelContentChange[]>;
}

export type EditorTheme = Record<ThemeType, string>;

/**
 * The configuration options for an editor.
 */
export interface IEditorConfig {
  theme: EditorTheme;
  /**
   * Half-period in milliseconds used for cursor blinking.
   * By setting this to zero, blinking can be disabled.
   * A negative value hides the cursor entirely.
   */
  cursorBlinkRate: number;

  /**
   * User preferred font family for text editors.
   */
  fontFamily: string | null;

  /**
   * User preferred size in pixel of the font used in text editors.
   */
  fontSize: number | null;

  /**
   * User preferred text line height, as a multiplier of font size.
   */
  lineHeight: number | null;

  /**
   * Whether line numbers should be displayed.
   */
  lineNumbers: boolean;

  /**
   * Control the line wrapping of the editor. Possible values are:
   * - "off", lines will never wrap.
   * - "on", lines will wrap at the viewport border.
   * - "wordWrapColumn", lines will wrap at `wordWrapColumn`.
   * - "bounded", lines will wrap at minimum between viewport width and wordWrapColumn.
   */
  lineWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';

  /**
   * Whether the editor content is read-only.
   */
  readOnly: boolean;

  /**
   * whther the editor view is editable.
   */
  editable: boolean;

  /**
   * The number of spaces a tab is equal to.
   */
  tabSize: number;

  /**
   * Whether to insert spaces when pressing Tab.
   */
  insertSpaces: boolean;

  /**
   * Whether to highlight matching brackets when one of them is selected.
   */
  matchBrackets: boolean;

  /**
   * Whether to automatically close brackets after opening them.
   */
  autoClosingBrackets: boolean;

  /**
   * Whether the editor should handle paste events.
   */
  handlePaste?: boolean;

  /**
   * The column where to break text line.
   */
  wordWrapColumn: number;

  /**
   * Column index at which rulers should be added.
   */
  rulers: number[];

  /**
   * Whether to allow code folding
   */
  codeFolding: boolean;

  /**
   * Whether to highlight trailing whitespace
   */
  showTrailingSpace: boolean;

  foldGutter?: boolean;

  styleActiveLine?: boolean;

  highlightActiveLineGutter?: boolean;

  placeholder?: HTMLElement | string;

  lspEnabled: boolean;

  paddingTop: number;

  paddingBottom: number;

  scrollBarHeight: number;
}

/**
 * The default configuration options for an editor.
 */
export const defaultConfig: Required<IEditorConfig> = {
  theme: {
    light: 'light',
    dark: 'dark',
    hc: 'hc-mana',
  },
  // Order matters as gutters will be sorted by the configuration order
  autoClosingBrackets: true,
  cursorBlinkRate: 530,
  fontFamily: null,
  fontSize: 13,
  handlePaste: true,
  insertSpaces: true,
  lineHeight: null,
  lineNumbers: true,
  lineWrap: 'off',
  matchBrackets: true,
  readOnly: false,
  editable: true,
  tabSize: 4,
  rulers: [],
  showTrailingSpace: false,
  wordWrapColumn: 80,
  codeFolding: true,
  foldGutter: true,
  styleActiveLine: false,
  highlightActiveLineGutter: false,
  lspEnabled: true,
  paddingTop: 12,
  paddingBottom: 18,
  scrollBarHeight: 0,
  placeholder: '',
};

export type TooltipProviderOption = { cursorPosition: number };

export type TooltipProvider = (option: TooltipProviderOption) => Promise<string | null>;

export type CompletionProviderOption = { cursorPosition: number };
export type CompletionReply = {
  matches: string[];
  cursor_start: number;
  cursor_end: number;
  metadata: JSONObject;
};
export type CompletionProvider = (
  option: CompletionProviderOption,
) => Promise<CompletionReply>;

/**
 * The options used to initialize an editor state.
 */
export interface IEditorStateOptions {
  /**
   * The model used by the editor.
   */
  model: IModel;

  /**
   * The desired uuid for the editor.
   */
  uuid: string;
}

/**
 * The options used to initialize an editor.
 */
export interface IEditorOptions extends IEditorStateOptions {
  /**
   * The host widget used by the editor.
   */
  host: HTMLElement;

  /**
   * The default selection style for the editor.
   */
  selectionStyle?: Partial<IEditorSelectionStyle>;

  /**
   * The configuration options for the editor.
   */
  config?: Partial<IEditorConfig>;

  // /**
  //  * The configuration options for the editor.
  //  */
  // translator?: ITranslator;

  //
  tooltipProvider?: TooltipProvider;
  completionProvider?: CompletionProvider;
}

/**
 * Base search match interface
 */
export interface SearchMatch {
  /**
   * Text of the exact match itself
   */
  readonly text: string;

  /**
   * Start location of the match (in a text, this is the column)
   */
  position: number;
}

export interface EditorState<T = any> {
  // monaco model or codemirror state or other editor state
  state: T;
  cursorPosition?: IPosition;
  selections?: IRange[];
  toJSON: () => JSONValue;
  dispose: (state: T) => void;
}

export type EditorStateFactory<T = any> = (
  options: IEditorStateOptions,
) => EditorState<T>;

/**
 * A factory used to create a code editor.
 */
export type CodeEditorFactory<T = EditorState> = (
  options: IEditorOptions,
  state?: T,
) => IEditor<T>;

export const CodeEditorContribution = Syringe.defineToken('CodeEditorContribution');
export interface CodeEditorContribution<T = any> {
  canHandle(mime: string): number;
  /**
   * editor factory
   */
  factory: CodeEditorFactory<T>;
  /**
   * editor state factory
   */
  stateFactory?: EditorStateFactory<T>;
  defaultConfig: IEditorConfig;
}

export interface IModelContentChange {
  /**
   * The range that got replaced.
   */
  readonly range: IRange;
  /**
   * The offset of the range that got replaced.
   */
  readonly rangeOffset: number;
  /**
   * The length of the range that got replaced.
   */
  readonly rangeLength: number;
  /**
   * The new text for the range.
   */
  readonly text: string;
}
