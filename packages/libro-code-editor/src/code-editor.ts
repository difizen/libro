import type { JSONObject } from '@difizen/libro-common';
import type { Disposable, Event } from '@difizen/mana-app';
import type {
  DidChangeConfigurationParams,
  ServerCapabilities,
} from 'vscode-languageserver-protocol';

import type { IModel } from './model.js';

/**
 * Code editor accessor.
 */
export interface ILSPEditor {
  /**
   * CodeEditor getter.
   *
   * It will return `null` if the editor is not yet instantiated;
   * e.g. to support windowed notebook.
   */
  getEditor(): IEditor | null;

  /**
   * Promise getter that resolved when the editor is instantiated.
   */
  ready(): Promise<IEditor>;

  /**
   * Reveal the code editor in viewport.
   *
   * ### Notes
   * The promise will resolve when the editor is instantiated and in
   * the viewport.
   */
  reveal(): Promise<IEditor>;
}

/**
 * A zero-based position in the editor.
 */
export interface IPosition extends JSONObject {
  /**
   * The cursor line number.
   */
  readonly line: number;

  /**
   * The cursor column number.
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
export interface IEditor extends ISelectionOwner, Disposable {
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
   * Lines are 0-based, and accessing a line out of range returns
   * `undefined`.
   */
  getLine: (line: number) => string | undefined;

  /**
   * Find an offset for the given position.
   *
   * @param position - The position of interest.
   *
   * @returns The offset at the position, clamped to the extent of the
   * editor contents.
   */
  getOffsetAt: (position: IPosition) => number;

  // /**
  //  * Find a position for the given offset.
  //  *
  //  * @param offset - The offset of interest.
  //  *
  //  * @returns The position at the offset, clamped to the extent of the
  //  * editor contents.
  //  */
  // getPositionAt: (offset: number) => IPosition | undefined;

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

  /**
   * Get the cursor position given window coordinates.
   *
   * @param coordinate - The desired coordinate.
   *
   * @returns The position of the coordinates, or null if not
   *   contained in the editor.
   */
  getPositionForCoordinate: (coordinate: ICoordinate) => IPosition | null;

  onModalChange: Event<boolean>;
}

/**
 * A factory used to create a code editor.
 */
export type CodeEditorFactory = (options: IEditorOptions) => IEditor;

/**
 * The configuration options for an editor.
 */
export interface IEditorConfig {
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
}

/**
 * The default configuration options for an editor.
 */
export const defaultConfig: IEditorConfig = {
  // Order matters as gutters will be sorted by the configuration order
  autoClosingBrackets: true,
  cursorBlinkRate: 530,
  fontFamily: null,
  fontSize: null,
  handlePaste: true,
  insertSpaces: true,
  lineHeight: null,
  lineNumbers: true,
  lineWrap: 'on',
  matchBrackets: true,
  readOnly: false,
  editable: true,
  tabSize: 4,
  rulers: [],
  showTrailingSpace: false,
  wordWrapColumn: 80,
  codeFolding: false,
  foldGutter: true,
  styleActiveLine: false,
  highlightActiveLineGutter: false,
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

export type LSPProviderResult = {
  virtualDocument: IVirtualDocument;
  lspConnection: ILspConnection;
  editor: ILSPEditor;
};

export type LSPProvider = () => Promise<LSPProviderResult>;

export interface Position {
  /**
   * Line number
   */
  line: number;

  /**
   * Position of character in line
   */
  ch: number;
}

/**
 * is_* attributes are there only to enforce strict interface type checking
 */
export interface ISourcePosition extends Position {
  isSource: true;
}

export interface IEditorPosition extends Position {
  isEditor: true;
}

export interface IVirtualPosition extends Position {
  isVirtual: true;
}

export interface IRootPosition extends ISourcePosition {
  isRoot: true;
}
export interface IVirtualDocument {
  uri: string;

  /**
   * Get the corresponding editor of the virtual line.
   */
  getEditorAtVirtualLine: (pos: IVirtualPosition) => ILSPEditor;
  transformEditorToVirtual: (
    editor: ILSPEditor,
    position: IEditorPosition,
  ) => IVirtualPosition | null;
  ttransformVirtualToEditor: (
    virtualPosition: IVirtualPosition,
  ) => IEditorPosition | null;
}

export interface IDocumentInfo {
  /**
   * URI of the virtual document.
   */
  uri: string;

  /**
   * Version of the virtual document.
   */
  version: number;

  /**
   * Text content of the document.
   */
  text: string;

  /**
   * Language id of the document.
   */
  languageId: string;
}
export interface ILspConnection {
  /**
   * Is the language server is connected?
   */
  isConnected: boolean;
  /**
   * Is the language server is initialized?
   */
  isInitialized: boolean;

  /**
   * Is the language server is connected and initialized?
   */
  isReady: boolean;

  /**
   * Initialize a connection over a web socket that speaks the LSP protocol
   */
  connect(socket: WebSocket): void;

  /**
   * Close the connection
   */
  close(): void;

  // This should support every method from https://microsoft.github.io/language-server-protocol/specification
  /**
   * The initialize request tells the server which options the client supports
   */
  sendInitialize(): void;
  /**
   * Inform the server that the document was opened
   */
  sendOpen(documentInfo: IDocumentInfo): void;

  /**
   * Sends the full text of the document to the server
   */
  sendChange(documentInfo: IDocumentInfo): void;

  /**
   * Send save notification to the server.
   */
  sendSaved(documentInfo: IDocumentInfo): void;

  /**
   * Send configuration change to the server.
   */
  sendConfigurationChange(settings: DidChangeConfigurationParams): void;

  provides(provider: keyof ServerCapabilities): boolean;
}

/**
 * The options used to initialize an editor.
 */
export interface IEditorOptions {
  /**
   * The host widget used by the editor.
   */
  host: HTMLElement;

  /**
   * The model used by the editor.
   */
  model: IModel;

  /**
   * The desired uuid for the editor.
   */
  uuid?: string | undefined;

  /**
   * The default selection style for the editor.
   */
  selectionStyle?: Partial<IEditorSelectionStyle> | undefined;

  /**
   * The configuration options for the editor.
   */
  config?: Partial<IEditorConfig> | undefined;

  // /**
  //  * The configuration options for the editor.
  //  */
  // translator?: ITranslator;

  //
  tooltipProvider?: TooltipProvider | undefined;
  completionProvider?: CompletionProvider | undefined;
  lspProvider?: LSPProvider | undefined;
}
