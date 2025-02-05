import { insertNewlineAndIndent, redo, undo } from '@codemirror/commands';
import { ensureSyntaxTree } from '@codemirror/language';
import type {
  ChangeSet,
  Extension,
  Range,
  StateCommand,
  StateEffectType,
  Text,
} from '@codemirror/state';
import {
  EditorSelection,
  EditorState,
  Prec,
  StateEffect,
  StateField,
} from '@codemirror/state';
import type { Command, DecorationSet, ViewUpdate } from '@codemirror/view';
import { Decoration, EditorView } from '@codemirror/view';
import { defaultConfig, defaultSelectionStyle } from '@difizen/libro-code-editor';
import type {
  EditorState as LibroEditorState,
  ICoordinate,
  IEditor,
  IEditorConfig,
  IEditorOptions,
  IEditorSelectionStyle,
  IModel,
  IPosition,
  IRange,
  ITextSelection,
  IToken,
  KeydownHandler,
  SearchMatch,
} from '@difizen/libro-code-editor';
import {
  findFirstArrayIndex,
  MIME,
  removeAllWhereFromArray,
} from '@difizen/libro-common';
import type { LSPProvider } from '@difizen/libro-lsp';
import { Deferred, Disposable, Emitter } from '@difizen/mana-app';
import { getOrigin, watch } from '@difizen/mana-app';
import type { SyntaxNodeRef } from '@lezer/common';
import { v4 } from 'uuid';

import type { CodeMirrorConfig } from './config.js';
import { EditorConfiguration } from './config.js';
import { stateFactory } from './factory.js';
import { codemirrorEnsure } from './mode.js';
import { monitorPlugin } from './monitor.js';

/**
 * The class name added to CodeMirrorWidget instances.
 */
const EDITOR_CLASS = 'jp-CodeMirrorEditor';

/**
 * The class name added to read only cell editor widgets.
 */
const READ_ONLY_CLASS = 'jp-mod-readOnly';

/**
 * The class name for the hover box for collaborator cursors.
 */
// const COLLABORATOR_CURSOR_CLASS = 'jp-CollaboratorCursor';

/**
 * The class name for the hover box for collaborator cursors.
 */
// const COLLABORATOR_HOVER_CLASS = 'jp-CollaboratorCursor-hover';

/**
 * The key code for the up arrow key.
 */
const UP_ARROW = 38;

/**
 * The key code for the down arrow key.
 */
const DOWN_ARROW = 40;

/**
 * The time that a collaborator name hover persists.
 */
// const HOVER_TIMEOUT = 1000;
/**
 * The default configuration options for an editor.
 */

// interface IYCodeMirrorBinding {
//   text: Y.Text;
//   awareness: Awareness | null;
//   undoManager: Y.UndoManager | null;
// }

export const codeMirrorDefaultConfig: Required<CodeMirrorConfig> = {
  ...defaultConfig,
  mode: 'null',
  mimetype: MIME.python,
  theme: { light: 'jupyter', dark: 'jupyter', hc: 'jupyter' },
  smartIndent: true,
  electricChars: true,
  keyMap: 'default',
  extraKeys: null,
  gutters: [],
  fixedGutter: true,
  showCursorWhenSelecting: false,
  coverGutterNextToScrollbar: false,
  dragDrop: true,
  lineSeparator: null,
  scrollbarStyle: 'native',
  lineWiseCopyCut: true,
  scrollPastEnd: false,
  styleActiveLine: false,
  styleSelectedText: true,
  selectionPointer: false,
  handlePaste: true,
  scrollBarHeight: 8,

  //
  highlightActiveLineGutter: false,
  highlightSpecialChars: true,
  history: true,
  drawSelection: true,
  dropCursor: true,
  allowMultipleSelections: true,
  autocompletion: true,
  rectangularSelection: true,
  crosshairCursor: true,
  highlightSelectionMatches: true,
  foldGutter: true,
  syntaxHighlighting: true,
  jupyterKernelCompletion: true,
  indentationMarkers: true,
  hyperLink: true,
  jupyterKernelTooltip: true,
  tabEditorFunction: true,
  lspCompletion: true,
  lspTooltip: true,
  lspLint: true,
  placeholder: '',
};

export class CodeMirrorEditor implements IEditor {
  protected editorReadyDeferred = new Deferred<void>();
  editorReady = this.editorReadyDeferred.promise;
  // highlight
  protected highlightEffect: StateEffectType<{
    matches: SearchMatch[];
    currentIndex: number | undefined;
  }>;
  protected highlightMark: Decoration;
  protected selectedMatchMark: Decoration;
  protected highlightField: StateField<DecorationSet>;

  protected editorState: LibroEditorState;

  /**
   * Construct a CodeMirror editor.
   */
  constructor(options: IOptions) {
    this._editorConfig = new EditorConfiguration(options);
    const host = (this.host = options.host);

    host.classList.add(EDITOR_CLASS);
    host.classList.add('jp-Editor');
    host.addEventListener('focus', this, true);
    host.addEventListener('blur', this, true);
    host.addEventListener('scroll', this, true);

    this._uuid = options.uuid || v4();
    this.editorState =
      options.state ?? stateFactory({ uuid: options.uuid, model: options.model });

    // State and effects for handling the selection marks
    this._addMark = StateEffect.define<ICollabSelectionText>();
    this._removeMark = StateEffect.define<ICollabDecorationSet>();

    this._markField = StateField.define<DecorationSet>({
      create: () => {
        return Decoration.none;
      },
      update: (marks, transaction) => {
        let _marks = marks.map(transaction.changes);
        for (const ef of transaction.effects) {
          if (ef.is(this._addMark)) {
            const e = ef;
            const decorations = this._buildMarkDecoration(
              e.value.uuid,
              e.value.selections,
            );
            _marks = _marks.update({ add: decorations });
            this._selectionMarkers[e.value.uuid] = decorations;
          } else if (ef.is(this._removeMark)) {
            const e = ef;
            for (const rd of ef.value.decorations) {
              _marks = _marks.update({
                filter: (from, to, value) => {
                  return !(from === rd.from && to === rd.to && value === rd.value);
                },
              });
            }
            delete this._selectionMarkers[e.value.uuid];
          }
        }
        return _marks;
      },
      provide: (f) => EditorView.decorations.from(f),
    });

    // handle highlight
    this.highlightEffect = StateEffect.define<{
      matches: SearchMatch[];
      currentIndex: number | undefined;
    }>({
      map: (value, mapping) => ({
        matches: value.matches.map((v) => ({
          text: v.text,
          position: mapping.mapPos(v.position),
        })),
        currentIndex: value.currentIndex,
      }),
    });
    this.highlightMark = Decoration.mark({ class: 'cm-searchMatch' });
    this.selectedMatchMark = Decoration.mark({
      class: 'cm-searchMatch cm-searchMatch-selected libro-selectedtext',
    });
    this.highlightField = StateField.define<DecorationSet>({
      create: () => {
        return Decoration.none;
      },
      update: (highlights, transaction) => {
        // eslint-disable-next-line no-param-reassign
        highlights = highlights.map(transaction.changes);
        for (const ef of transaction.effects) {
          if (ef.is(this.highlightEffect)) {
            const e = ef as StateEffect<{
              matches: SearchMatch[];
              currentIndex: number | undefined;
            }>;
            if (e.value.matches.length) {
              // eslint-disable-next-line no-param-reassign
              highlights = highlights.update({
                add: e.value.matches.map((m, index) => {
                  if (index === e.value.currentIndex) {
                    return this.selectedMatchMark.range(
                      m.position,
                      m.position + m.text.length,
                    );
                  }
                  return this.highlightMark.range(
                    m.position,
                    m.position + m.text.length,
                  );
                }),
                filter: (from, to) => {
                  return (
                    !e.value.matches.some(
                      (m) => m.position >= from && m.position + m.text.length <= to,
                    ) || from === to
                  );
                },
              });
            } else {
              // eslint-disable-next-line no-param-reassign
              highlights = Decoration.none;
            }
          }
        }
        return highlights;
      },
      provide: (f) => EditorView.decorations.from(f),
    });

    // Handle selection style.
    const style = options.selectionStyle || {};
    this._selectionStyle = {
      ...defaultSelectionStyle,
      ...(style as IEditorSelectionStyle),
    };

    const model = (this._model = options.model);

    const config = options.config || {};
    const fullConfig = (this._config = {
      ...codeMirrorDefaultConfig,
      ...config,
      mimetype: options.model.mimeType,
    });

    // this._initializeEditorBinding();

    // Extension for handling DOM events
    const domEventHandlers = EditorView.domEventHandlers({
      keydown: (event: KeyboardEvent) => {
        const index = findFirstArrayIndex(this._keydownHandlers, (handler) => {
          if (handler(this, event) === true) {
            event.preventDefault();
            return true;
          }
          return false;
        });
        if (index === -1) {
          return this.onKeydown(event);
        }
        return false;
      },
    });

    const updateListener = EditorView.updateListener.of((update: ViewUpdate) => {
      this._onDocChanged(update);
    });

    this._editor = createEditor(
      host,
      fullConfig,
      this.model.value,
      this._editorConfig,
      [
        this._markField,
        Prec.high(domEventHandlers),
        updateListener,

        monitorPlugin({ onTooltipChange: this.handleTooltipChange }),
      ],
    );

    this.editorReadyDeferred.resolve();

    // every time the model is switched, we need to re-initialize the editor binding
    // this.model.sharedModelSwitched.connect(this._initializeEditorBinding, this);

    this._onMimeTypeChanged();
    this._onCursorActivity();
    // this._poll = new Poll({
    //   factory: async () => {
    //     this._checkSync();
    //   },
    //   frequency: { interval: 3000, backoff: false },
    //   standby: () => {
    //     // If changed, only stand by when hidden, otherwise always stand by.
    //     return this._lastChange ? 'when-hidden' : true;
    //   },
    // });

    watch(model, 'mimeType', this._onMimeTypeChanged);
  }

  getState(): LibroEditorState {
    return {
      ...this.editorState,
      cursorPosition: this.getCursorPosition(),
      selections: this.getSelections(),
    };
  }

  /**
   * Initialize the editor binding.
   */
  // protected _initializeEditorBinding(): void {
  //   const sharedModel = this.model.sharedModel as models.IYText;
  //   this._yeditorBinding = {
  //     text: sharedModel.ysource,
  //     awareness: sharedModel.awareness,
  //     undoManager: sharedModel.undoManager,
  //   };
  // }

  save: () => void;
  /**
   * A signal emitted when either the top or bottom edge is requested.
   */
  readonly edgeRequestedEmitter = new Emitter();
  readonly edgeRequested = this.edgeRequestedEmitter.event;
  /**
   * The DOM node that hosts the editor.
   */
  readonly host: HTMLElement;
  /**
   * The uuid of this editor;
   */
  get uuid(): string {
    return this._uuid;
  }
  set uuid(value: string) {
    this._uuid = value;
  }

  protected modalChangeEmitter = new Emitter<boolean>();

  get onModalChange() {
    return this.modalChangeEmitter.event;
  }

  /**
   * The selection style of this editor.
   */
  get selectionStyle(): IEditorSelectionStyle {
    return this._selectionStyle;
  }
  set selectionStyle(value: IEditorSelectionStyle) {
    this._selectionStyle = value;
  }

  /**
   * Get the codemirror editor wrapped by the editor.
   */
  get editor(): EditorView {
    return this._editor;
  }

  /**
   * Get the codemirror doc wrapped by the widget.
   */
  get doc(): Text {
    return this._editor.state.doc;
  }

  /**
   * Get the number of lines in the editor.
   */
  get lineCount(): number {
    return this.doc.lines;
  }

  /**
   * Returns a model for this editor.
   */
  get model(): IModel {
    return this._model;
  }

  /**
   * The height of a line in the editor in pixels.
   */
  get lineHeight(): number {
    return this._editor.defaultLineHeight;
  }

  /**
   * The widget of a character in the editor in pixels.
   */
  get charWidth(): number {
    return this._editor.defaultCharacterWidth;
  }

  /**
   * Tests whether the editor is disposed.
   */
  get disposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose = (): void => {
    if (this.disposed) {
      return;
    }
    this._isDisposed = true;
    this.host.removeEventListener('focus', this, true);
    this.host.removeEventListener('blur', this, true);
    this.host.removeEventListener('scroll', this, true);
    this._keydownHandlers.length = 0;
    this.editor.destroy();
  };

  /**
   * Get a config option for the editor.
   */
  getOption<K extends keyof IConfig>(option: K): IConfig[K] {
    return this._config[option];
  }

  /**
   * Set a config option for the editor.
   */
  setOption<K extends keyof IEditorConfig>(option: K, value: IEditorConfig[K]): void {
    // Don't bother setting the option if it is already the same.
    if (this._config[option] !== value) {
      this._config[option] = value;
      if (!this.disposed) {
        this._editorConfig.reconfigureExtension(this._editor, option, value);
      }
    }

    if (option === 'readOnly') {
      if (value === true) {
        getOrigin(this._editor).dom.classList.add(READ_ONLY_CLASS);
      } else {
        getOrigin(this._editor).dom.classList.remove(READ_ONLY_CLASS);
      }
    }
  }
  /**
   * Set config options for the editor.
   *
   * This method is preferred when setting several options. The
   * options are set within an operation, which only performs
   * the costly update at the end, and not after every option
   * is set.
   */
  setOptions(options: Partial<IEditorConfig>): void {
    this._config = { ...this._config, ...options };
    this._editorConfig.reconfigureExtensions(this._editor, options);
  }

  injectExtension(ext: Extension): void {
    this._editorConfig.injectExtension(this._editor, ext);
  }

  /**
   * Returns the content for the given line number.
   */
  getLine(line: number): string | undefined {
    // TODO: CM6 remove +1 when CM6 first line number has propagated
    return line <= this.doc.lines ? this.doc.line(line).text : undefined;
  }

  /**
   * Find an offset for the given position.
   */
  getOffsetAt(position: IPosition): number {
    // TODO: CM6 remove +1 when CM6 first line number has propagated
    return this.doc.line(position.line).from + position.column - 1;
  }

  /**
   * Find a position for the given offset.
   */
  getPositionAt(offset: number): IPosition {
    // TODO: CM6 remove -1 when CM6 first line number has propagated
    const line = this.doc.lineAt(offset);
    return { line: line.number - 1, column: offset - line.from };
  }

  /**
   * Undo one edit (if any undo events are stored).
   */
  undo(): void {
    undo({
      state: getOrigin(this.state),
      dispatch: this.editor.dispatch,
    });
  }

  /**
   * Redo one undone edit.
   */
  redo(): void {
    redo({
      state: getOrigin(this.state),
      dispatch: this.editor.dispatch,
    });
  }

  /**
   * Clear the undo history.
   */
  clearHistory(): void {
    // this._yeditorBinding?.undoManager?.clear();
  }

  /**
   * Brings browser focus to this editor text.
   */
  focus(): void {
    getOrigin(this._editor).focus();
  }

  /**
   * Test whether the editor has keyboard focus.
   */
  hasFocus(): boolean {
    return getOrigin(this._editor).hasFocus;
  }

  /**
   * Explicitly blur the editor.
   */
  blur(): void {
    this._editor.contentDOM.blur();
  }

  /**
   * Refresh the editor if it is focused;
   * otherwise postpone refreshing till focusing.
   */
  resizeToFit(): void {
    this._clearHover();
  }

  get state(): EditorState {
    return this._editor.state;
  }

  firstLine(): number {
    // TODO: return 1 when CM6 first line number has propagated
    return 0;
  }

  lastLine(): number {
    return this.doc.lines - 1;
  }

  cursorCoords(
    where: boolean,
    // mode?: 'window' | 'page' | 'local',
  ): { left: number; top: number; bottom: number } {
    const selection = this.state.selection.main;
    const pos = where ? selection.from : selection.to;
    const rect = this.editor.coordsAtPos(pos);
    return rect as { left: number; top: number; bottom: number };
  }

  getRange(
    from: { line: number; ch: number },
    to: { line: number; ch: number },
    // separator?: string,
  ): string {
    const fromOffset = this.getOffsetAt(this._toPosition(from));
    const toOffset = this.getOffsetAt(this._toPosition(to));
    return this.state.sliceDoc(fromOffset, toOffset);
  }

  getSelectionValue(range?: IRange) {
    const fromOffset = range
      ? this.getOffsetAt(range.start)
      : this.editor.state.selection.main.from;
    const toOffset = range
      ? this.getOffsetAt(range.end)
      : this.editor.state.selection.main.to;
    return this.state.sliceDoc(fromOffset, toOffset);
  }

  /**
   * Add a keydown handler to the editor.
   *
   * @param handler - A keydown handler.
   *
   * @returns A disposable that can be used to remove the handler.
   */
  addKeydownHandler(handler: KeydownHandler): Disposable {
    this._keydownHandlers.push(handler);
    return Disposable.create(() => {
      removeAllWhereFromArray(this._keydownHandlers, (val) => val === handler);
    });
  }

  /**
   * Reveal the given position in the editor.
   */
  revealPosition(position: IPosition): void {
    const offset = this.getOffsetAt(position);
    this._editor.dispatch({
      effects: EditorView.scrollIntoView(offset),
    });
  }

  /**
   * Reveal the given selection in the editor.
   */
  revealSelection(selection: IRange): void {
    const start = this.getOffsetAt(selection.start);
    const end = this.getOffsetAt(selection.end);
    this._editor.dispatch({
      effects: EditorView.scrollIntoView(EditorSelection.range(start, end)),
    });
  }

  /**
   * Get the window coordinates given a cursor position.
   */
  getCoordinateForPosition(position: IPosition): ICoordinate {
    const offset = this.getOffsetAt(position);
    const rect = this.editor.coordsAtPos(offset);
    return rect as ICoordinate;
  }
  /**
   * Get the cursor position given window coordinates.
   *
   * @param coordinate - The desired coordinate.
   *
   * @returns The position of the coordinates, or null if not
   *   contained in the editor.
   */
  getPositionForCoordinate(coordinate: ICoordinate): IPosition | null {
    const offset = this.editor.posAtCoords({
      x: coordinate.left,
      y: coordinate.top,
    });
    return this.getPositionAt(offset!) || null;
  }

  /**
   * Returns the primary position of the cursor, never `null`.
   */
  getCursorPosition(): IPosition {
    const offset = this.state.selection.main.head;
    return this.getPositionAt(offset);
  }

  /**
   * Set the primary position of the cursor.
   *
   * #### Notes
   * This will remove any secondary cursors.
   */
  setCursorPosition(
    position: IPosition,
    // options?: { bias?: number; origin?: string; scroll?: boolean },
  ): void {
    const offset = this.getOffsetAt(position);
    this.editor.dispatch({
      selection: { anchor: offset },
      scrollIntoView: true,
    });
    // If the editor does not have focus, this cursor change
    // will get screened out in _onCursorsChanged(). Make an
    // exception for this method.
    if (!this.editor.hasFocus) {
      this.model.selections = this.getSelections();
    }
  }

  /**
   * Returns the primary selection, never `null`.
   */
  getSelection(): ITextSelection {
    return this.getSelections()[0];
  }

  /**
   * Set the primary selection. This will remove any secondary cursors.
   */
  setSelection(selection: IRange): void {
    this.setSelections([selection]);
  }

  /**
   * Gets the selections for all the cursors, never `null` or empty.
   */
  getSelections(): ITextSelection[] {
    const selections = this.state.selection.ranges; //= [{anchor: number, head: number}]
    if (selections.length > 0) {
      const sel = selections.map((r) => ({
        anchor: this._toCodeMirrorPosition(this.getPositionAt(r.from)),
        head: this._toCodeMirrorPosition(this.getPositionAt(r.to)),
      }));
      return sel.map((selection) => this._toSelection(selection));
    }
    const cursor = this._toCodeMirrorPosition(
      this.getPositionAt(this.state.selection.main.head),
    );
    const selection = this._toSelection({ anchor: cursor, head: cursor });
    return [selection];
  }

  /**
   * Sets the selections for all the cursors, should not be empty.
   * Cursors will be removed or added, as necessary.
   * Passing an empty array resets a cursor position to the start of a document.
   */
  setSelections(selections: IRange[]): void {
    const sel = selections.length
      ? selections.map((r) =>
          EditorSelection.range(this.getOffsetAt(r.start), this.getOffsetAt(r.end)),
        )
      : [EditorSelection.range(0, 0)];
    this.editor.dispatch({ selection: EditorSelection.create(sel) });
  }

  /**
   * Replaces the current selection with the given text.
   *
   * @param text The text to be inserted.
   */
  replaceSelection(text: string, range: IRange): void {
    this.editor.dispatch({
      changes: {
        from: this.getOffsetAt(range.start),
        to: this.getOffsetAt(range.end),
        insert: text,
      },
    });
  }

  replaceSelections(edits: { text: string; range: IRange }[]): void {
    // const trans = this.state.replaceSelection(text);
    this.editor.dispatch({
      changes: edits.map((item) => ({
        from: this.getOffsetAt(item.range.start),
        to: this.getOffsetAt(item.range.end),
        insert: item.text,
      })),
    });
  }

  highlightMatches(matches: SearchMatch[], currentIndex: number | undefined) {
    const effects: StateEffect<unknown>[] = [
      this.highlightEffect.of({ matches: matches, currentIndex: currentIndex }),
    ];
    if (!this.state.field(this.highlightField, false)) {
      effects.push(StateEffect.appendConfig.of([this.highlightField]));
    }
    this.editor.dispatch({ effects });
  }

  handleTooltipChange = (val: boolean) => {
    this.modalChangeEmitter.fire(val);
  };

  /**
   * Get a list of tokens for the current editor text content.
   */
  getTokens(): IToken[] {
    const tokens: IToken[] = [];
    const tree = ensureSyntaxTree(this.state, this.doc.length);
    if (tree) {
      tree.iterate({
        enter: (node: SyntaxNodeRef) => {
          tokens.push({
            value: this.state.sliceDoc(node.from, node.to),
            offset: node.from,
            type: node.name,
          });
          return true;
        },
      });
    }
    return tokens;
  }

  /**
   * Get the token at a given editor position.
   */
  getTokenAt(offset: number): IToken {
    const tree = ensureSyntaxTree(this.state, offset);
    if (tree) {
      const node = tree.resolveInner(offset);
      return {
        value: this.state.sliceDoc(node.from, node.to),
        offset: node.from,
        type: node.name,
      };
    } else {
      return {
        value: '',
        offset: offset,
      };
    }
  }

  /**
   * Get the token a the cursor position.
   */
  getTokenAtCursor(): IToken {
    return this.getTokenAt(this.state.selection.main.head);
  }

  /**
   * Insert a new indented line at the current cursor position.
   */
  newIndentedLine(): void {
    insertNewlineAndIndent({
      state: this.state,
      dispatch: this.editor.dispatch,
    });
  }

  /**
   * Execute a codemirror command on the editor.
   *
   * @param command - The name of the command to execute.
   */
  execCommand(command: Command | StateCommand): void {
    command(this.editor);
  }

  format: () => void;

  /**
   * Handle keydown events from the editor.
   */
  protected onKeydown(event: KeyboardEvent): boolean {
    const position = this.state.selection.main.head;

    if (position === 0 && event.keyCode === UP_ARROW) {
      if (!event.shiftKey) {
        // this.edgeRequested.emit('top');
        this.edgeRequestedEmitter.fire('top');
      }
      return false;
    }

    const line = this.doc.lineAt(position).number;
    if (line === 1 && event.keyCode === UP_ARROW) {
      if (!event.shiftKey) {
        // this.edgeRequested.emit('topLine');
        this.edgeRequestedEmitter.fire('topLine');
      }
      return false;
    }

    const length = this.doc.length;
    if (position === length && event.keyCode === DOWN_ARROW) {
      if (!event.shiftKey) {
        // this.edgeRequested.emit('bottom');
        this.edgeRequestedEmitter.fire('bottom');
      }
      return false;
    }

    return false;
  }

  /**
   * Handles a mime type change.
   */
  protected _onMimeTypeChanged(): void {
    const mime = this._model.mimeType;
    // TODO: should we provide a hook for when the mode is done being set?
    void codemirrorEnsure(mime).then((spec) => {
      if (spec) {
        this._editorConfig.reconfigureExtension(
          this._editor,
          'language',
          spec.support!,
        );
      }
      return;
    });
  }

  /**
   * Handles a selections change.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected _onSelectionsChanged(args: ITextSelection[]): void {
    // const uuid = args.key;
    // if (uuid !== this.uuid) {
    //   this._cleanSelections(uuid);
    //   if (args.type !== 'remove' && args.newValue) {
    //     this._markSelections(uuid, args.newValue);
    //   }
    // }
  }

  /**
   * Clean selections for the given uuid.
   */
  protected _cleanSelections(uuid: string) {
    this.editor.dispatch({
      effects: this._removeMark.of({
        uuid: uuid,
        decorations: this._selectionMarkers[uuid],
      }),
    });
  }

  protected _buildMarkDecoration(
    uuid: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selections: ISelectionText[],
  ) {
    const decorations: Range<Decoration>[] = [];

    // If we are marking selections corresponding to an active hover,
    // remove it.
    if (uuid === this._hoverId) {
      this._clearHover();
    }
    // If we can id the selection to a specific collaborator,
    // use that information.
    // let collaborator: ICollaborator | undefined;
    // if (this._model.modelDB.collaborators) {
    //   collaborator = this._model.modelDB.collaborators.get(uuid);
    // }

    // Style each selection for the uuid.
    // selections.forEach(selection => {
    //   const from = selection.from;
    //   const to = selection.to;
    //   // Only render selections if the start is not equal to the end.
    //   // In that case, we don't need to render the cursor.
    //   if (from !== to) {
    //     const style = collaborator
    //       ? { ...selection.style, color: collaborator.color }
    //       : selection.style;
    //     const decoration = Decoration.mark({
    //       attributes: this._toMarkSpec(style),
    //     });
    //     decorations.push(from > to ? decoration.range(to, from) : decoration.range(to, from));
    //   } else if (collaborator) {
    //     const caret = Decoration.widget({
    //       widget: this._getCaret(collaborator),
    //     });
    //     decorations.push(caret.range(from));
    //   }
    // });

    return decorations;
  }

  /**
   * Converts the selection style to a text marker options.
   */
  // protected _toMarkSpec(style: IEditorSelectionStyle) {
  //   const r = parseInt(style.color.slice(1, 3), 16);
  //   const g = parseInt(style.color.slice(3, 5), 16);
  //   const b = parseInt(style.color.slice(5, 7), 16);
  //   const css = `background-color: rgba( ${r}, ${g}, ${b}, 0.15)`;
  //   return {
  //     className: style.className,
  //     title: style.displayName,
  //     css,
  //   };
  // }

  /**
   * Construct a caret element representing the position
   * of a collaborator's cursor.
   */
  // protected _getCaret(collaborator: ICollaborator): CaretWidget {
  //   return new CaretWidget(collaborator, {
  //     setHoverId: (sessionId: string) => {
  //       this._clearHover();
  //       this._hoverId = sessionId;
  //     },
  //     setHoverTimeout: () => {
  //       this._hoverTimeout = window.setTimeout(() => {
  //         this._clearHover();
  //       }, HOVER_TIMEOUT);
  //     },
  //     clearHoverTimeout: () => {
  //       window.clearTimeout(this._hoverTimeout);
  //     },
  //   });
  // }

  /**
   * Marks selections.
   */
  protected _markSelections(uuid: string, selections: ITextSelection[]) {
    const sel = selections.map((selection) => ({
      from: this.getOffsetAt(selection.start),
      to: this.getOffsetAt(selection.end),
      style: selection.style,
    }));
    this.editor.dispatch({
      effects: this._addMark.of({ uuid: uuid, selections: sel }),
    });
  }

  /**
   * Handles a cursor activity event.
   */
  protected _onCursorActivity(): void {
    // Only add selections if the editor has focus. This avoids unwanted
    // triggering of cursor activity due to collaborator actions.
    if (this._editor.hasFocus) {
      const selections = this.getSelections();
      this.model.selections = selections;
    }
  }

  /**
   * Converts a code mirror selection to an editor selection.
   */
  protected _toSelection(selection: {
    anchor: { line: number; ch: number };
    head: { line: number; ch: number };
  }): ITextSelection {
    return {
      uuid: this.uuid,
      start: this._toPosition(selection.anchor),
      end: this._toPosition(selection.head),
      style: this.selectionStyle,
    };
  }
  /**
   * Convert a code mirror position to an editor position.
   */
  protected _toPosition(position: { line: number; ch: number }) {
    return {
      line: position.line,
      column: position.ch,
    };
  }

  /**
   * Convert an editor position to a code mirror position.
   */
  protected _toCodeMirrorPosition(position: IPosition) {
    return {
      line: position.line,
      ch: position.column,
    };
  }

  /**
   * Handles document changes.
   */
  protected _onDocChanged(update: ViewUpdate) {
    if (update.transactions.length && update.transactions[0].selection) {
      this._onCursorActivity();
    }

    if (update.docChanged) {
      this._lastChange = update.changes;
    }
    this.model.value = update.state.doc.toJSON().join('\n');
    this.host.style.height = update.view.dom.offsetHeight + 'px';
  }
  /**
   * Handle the DOM events for the editor.
   *
   * @param event - The DOM event sent to the editor.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the editor's DOM node. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'focus':
        this._evtFocus();
        break;
      case 'blur':
        this._evtBlur();
        break;
      case 'scroll':
        this._evtScroll();
        break;
      default:
        break;
    }
  }

  /**
   * Handle `focus` events for the editor.
   */
  protected _evtFocus(): // event: FocusEvent
  void {
    this.host.classList.add('jp-mod-focused');

    // Update the selections on editor gaining focus because
    // the onCursorActivity function filters usual cursor events
    // based on the editor's focus.
    this._onCursorActivity();
  }

  /**
   * Handle `blur` events for the editor.
   */
  protected _evtBlur(): // event: FocusEvent
  void {
    this.host.classList.remove('jp-mod-focused');
  }

  /**
   * Handle `scroll` events for the editor.
   */
  protected _evtScroll(): void {
    // Remove any active hover.
    this._clearHover();
  }

  /**
   * Clear the hover for a caret, due to things like
   * scrolling, resizing, deactivation, etc, where
   * the position is no longer valid.
   */
  protected _clearHover(): void {
    if (this._caretHover) {
      window.clearTimeout(this._hoverTimeout);
      document.body.removeChild(this._caretHover);
      this._caretHover = null;
    }
  }
  /**
   * Check for an out of sync editor.
   */
  protected _checkSync(): void {
    const change = this._lastChange;
    if (!change) {
      return;
    }
    this._lastChange = null;
    const doc = this.doc;
    if (doc.toString() === this._model.value) {
      return;
    }

    // void showDialog({
    //   title: this._trans.__('Code Editor out of Sync'),
    //   body: this._trans.__(
    //     'Please open your browser JavaScript console for bug report instructions',
    //   ),
    // });
    console.warn(
      'If you are able and willing to publicly share the text or code in your editor, you can help us debug the "Code Editor out of Sync" message by pasting the following to the public issue at https://github.com/jupyterlab/jupyterlab/issues/2951. Please note that the data below includes the text/code in your editor.',
    );
    console.warn(
      JSON.stringify({
        model: this._model.value,
        view: doc.toString(),
        selections: this.getSelections(),
        cursor: this.getCursorPosition(),
        lineSep: this.state.facet(EditorState.lineSeparator),
        change,
      }),
    );
  }
  protected _model: IModel;
  protected _editor: EditorView;
  protected _selectionMarkers: Record<string, Range<Decoration>[]> = {};
  protected _caretHover: HTMLElement | null;
  protected _config: IConfig;
  protected _hoverTimeout: number;
  protected _hoverId: string;
  protected _keydownHandlers = new Array<KeydownHandler>();
  protected _selectionStyle: IEditorSelectionStyle;
  protected _uuid = '';
  protected _isDisposed = false;
  protected _lastChange: ChangeSet | null = null;
  // protected _poll: Poll;
  // protected _yeditorBinding: IYCodeMirrorBinding | null;
  protected _editorConfig: EditorConfiguration;
  protected _addMark: StateEffectType<ICollabSelectionText>;
  protected _removeMark: StateEffectType<ICollabDecorationSet>;
  protected _markField: StateField<DecorationSet>;
}

export type IConfig = CodeMirrorConfig;

export interface IOptions extends IEditorOptions {
  lspProvider?: LSPProvider;
  /**
   * The configuration options for the editor.
   */
  config?: Partial<IConfig>;
  state?: LibroEditorState;
}

export function createEditor(
  host: HTMLElement,
  config: IConfig,
  value: string,
  editorConfig: EditorConfiguration,
  additionalExtensions: Extension[],
): EditorView {
  const extensions = editorConfig.getInitialExtensions(config);

  extensions.push(...additionalExtensions);
  const view = new EditorView({
    state: EditorState.create({
      doc: value,
      extensions,
    }),
    parent: host,
  });

  if (config.readOnly) {
    view.dom.classList.add(READ_ONLY_CLASS);
  }

  return view;
}

export interface ISelectionText {
  from: number;
  to: number;
  style: IEditorSelectionStyle;
}
export interface ICollabSelectionText {
  uuid: string;
  selections: ISelectionText[];
}

export interface ICollabDecorationSet {
  uuid: string;
  decorations: Range<Decoration>[];
}
