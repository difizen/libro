/* eslint-disable @typescript-eslint/no-redeclare */
import type {
  CodeEditorFactory,
  CompletionProvider,
  EditorState,
  ICoordinate,
  IEditor,
  IEditorConfig,
  IEditorOptions,
  IModel,
  IModelContentChange,
  IPosition,
  IRange,
  SearchMatch,
  TooltipProvider,
} from '@difizen/libro-code-editor';
import {
  defaultConfig,
  LanguageSpecRegistry,
} from '@difizen/libro-code-editor';
import { MIME } from '@difizen/libro-common';
import type {
  EditorStateFactory,
  IEditorStateOptions,
} from '@difizen/libro-jupyter';
import type { LSPProvider } from '@difizen/libro-lsp';
import {
  CommandRegistry,
  Deferred,
  Disposable,
  DisposableCollection,
  Emitter,
  getOrigin,
  inject,
  ThemeService,
  transient,
  watch,
} from '@difizen/mana-app';
import type { Injector } from '@opensumi/di';
import { IEventBus, URI } from '@opensumi/ide-core-common';
import type {
  ICodeEditor as IOpensumiEditor,
  IEditorDocumentModelRef,
} from '@opensumi/ide-editor';
import { EditorCollectionService } from '@opensumi/ide-editor';
import { IEditorDocumentModelService } from '@opensumi/ide-editor/lib/browser/doc-model/types';
import type * as monacoTypes from '@opensumi/ide-monaco';
import type { ICodeEditor as IMonacoCodeEditor } from '@opensumi/ide-monaco/lib/browser/monaco-api/types';
import { Selection } from '@opensumi/monaco-editor-core';
import { Range as MonacoRange } from '@opensumi/monaco-editor-core/esm/vs/editor/common/core/range';
import type { IStandaloneEditorConstructionOptions as MonacoEditorOptions } from '@opensumi/monaco-editor-core/esm/vs/editor/standalone/browser/standaloneCodeEditor';
import { setModelLanguage } from '@opensumi/monaco-editor-core/esm/vs/editor/standalone/browser/standaloneEditor';
import 'resize-observer-polyfill';
import { v4 } from 'uuid';

import { OpensumiInjector } from '../../common';
import './index.less';

export interface LibroOpensumiEditorConfig extends IEditorConfig {
  /**
   * The mode to use.
   */
  mode?: string;

  /**
   * content mimetype
   */
  mimetype?: string;

  // FIXME-TRANS: Handle theme localizable names
  // themeDisplayName?: string

  /**
   * Whether to use the context-sensitive indentation that the mode provides
   * (or just indent the same as the line before).
   */
  smartIndent?: boolean;

  /**
   * Configures whether the editor should re-indent the current line when a
   * character is typed that might change its proper indentation
   * (only works if the mode supports indentation).
   */
  electricChars?: boolean;

  /**
   * Configures the keymap to use. The default is "default", which is the
   * only keymap defined in codemirror.js itself.
   * Extra keymaps are found in the CodeMirror keymap directory.
   */
  keyMap?: string;

  /**
   * Can be used to specify extra keybindings for the editor, alongside the
   * ones defined by keyMap. Should be either null, or a valid keymap value.
   */
  // extraKeys?: KeyBinding[] | null;

  /**
   * Can be used to add extra gutters (beyond or instead of the line number
   * gutter).
   * Should be an array of CSS class names, each of which defines a width
   * (and optionally a background),
   * and which will be used to draw the background of the gutters.
   * May include the CodeMirror-linenumbers class, in order to explicitly
   * set the position of the line number gutter
   * (it will default to be to the right of all other gutters).
   * These class names are the keys passed to setGutterMarker.
   */
  gutters?: string[];

  /**
   * Determines whether the gutter scrolls along with the content
   * horizontally (false)
   * or whether it stays fixed during horizontal scrolling (true,
   * the default).
   */
  fixedGutter?: boolean;

  /**
   * Whether the cursor should be drawn when a selection is active.
   */
  showCursorWhenSelecting?: boolean;

  /**
   * When fixedGutter is on, and there is a horizontal scrollbar, by default
   * the gutter will be visible to the left of this scrollbar. If this
   * option is set to true, it will be covered by an element with class
   * CodeMirror-gutter-filler.
   */
  coverGutterNextToScrollbar?: boolean;

  /**
   * Controls whether drag-and-drop is enabled.
   */
  dragDrop?: boolean;

  /**
   * Explicitly set the line separator for the editor.
   * By default (value null), the document will be split on CRLFs as well as
   * lone CRs and LFs, and a single LF will be used as line separator in all
   * output (such as getValue). When a specific string is given, lines will
   * only be split on that string, and output will, by default, use that
   * same separator.
   */
  lineSeparator?: string | null;

  /**
   * Chooses a scrollbar implementation. The default is "native", showing
   * native scrollbars. The core library also provides the "null" style,
   * which completely hides the scrollbars. Addons can implement additional
   * scrollbar models.
   */
  scrollbarStyle?: string;

  /**
   * When enabled, which is the default, doing copy or cut when there is no
   * selection will copy or cut the whole lines that have cursors on them.
   */
  lineWiseCopyCut?: boolean;

  /**
   * Whether to scroll past the end of the buffer.
   */
  scrollPastEnd?: boolean;

  /**
   * Whether to give the wrapper of the line that contains the cursor the class
   * cm-activeLine.
   */
  styleActiveLine?: boolean;

  /**
   * Whether to causes the selected text to be marked with the CSS class
   * CodeMirror-selectedtext. Useful to change the colour of the selection
   * (in addition to the background).
   */
  styleSelectedText?: boolean;

  /**
   * Defines the mouse cursor appearance when hovering over the selection.
   * It can be set to a string, like "pointer", or to true,
   * in which case the "default" (arrow) cursor will be used.
   */
  selectionPointer?: boolean | string;
}

export const LibroOpensumiEditorOptions = Symbol('LibroOpensumiEditorOptions');

export interface LibroOpensumiEditorOptions extends IEditorOptions {
  lspProvider?: LSPProvider;

  /**
   * The configuration options for the editor.
   */
  config?: Partial<LibroOpensumiEditorConfig>;
}

export const libroOpensumiEditorDefaultConfig: Required<LibroOpensumiEditorConfig> =
  {
    ...defaultConfig,
    scrollBarHeight: 12,
    mode: 'null',
    mimetype: MIME.python,
    smartIndent: true,
    electricChars: true,
    keyMap: 'default',
    // extraKeys: null,
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
    lineWrap: 'off',
  };

export const LibroOpensumiEditorFactory = Symbol('LibroOpensumiEditorFactory');
export type LibroOpensumiEditorFactory = CodeEditorFactory;

export const OpensumiEditorClassname = 'libro-opensumi-editor';

export type OpensumiEditorState = IEditorDocumentModelRef | null;
export const LibroOpensumiEditorState = Symbol('LibroOpensumiEditorState');
export type LibroOpensumiEditorState = EditorState<OpensumiEditorState>;

export const stateFactory: (
  injector: Injector,
) => EditorStateFactory<OpensumiEditorState> =
  (injector) => (options: IEditorStateOptions) => {
    const docModelService: IEditorDocumentModelService = injector.get(
      IEditorDocumentModelService,
    );
    const uri = URI.parse(options.uuid);
    const modeRef = getOrigin(docModelService).getModelReference(uri);
    return {
      toJSON: () => {
        return {};
      },
      dispose: () => {
        modeRef?.instance.getMonacoModel()?.dispose();
      },
      state: modeRef,
    };
  };

@transient()
export class LibroOpensumiEditor implements IEditor {
  protected editorReadyDeferred = new Deferred<void>();
  editorReady = this.editorReadyDeferred.promise;

  protected readonly themeService: ThemeService;
  protected readonly injector: Injector;

  @inject(CommandRegistry) protected readonly commandRegistry: CommandRegistry;

  protected readonly languageSpecRegistry: LanguageSpecRegistry;

  protected defaultLineHeight = 20;

  protected toDispose = new DisposableCollection();

  /**
   * The DOM node that hosts the editor.
   */
  readonly host: HTMLElement;
  /**
   * The DOM node that hosts the monaco editor.
   */
  readonly editorHost: HTMLElement;

  protected oldDeltaDecorations: string[] = [];

  protected _config: LibroOpensumiEditorConfig;

  private intersectionObserver: IntersectionObserver;

  private editorContentHeight: number;

  protected _uuid = '';
  /**
   * The uuid of this editor;
   */
  get uuid(): string {
    return this._uuid;
  }
  set uuid(value: string) {
    this._uuid = value;
  }

  protected _model: IModel;
  /**
   * Returns a model for this editor.
   */
  get model(): IModel {
    return this._model;
  }

  editorState: EditorState<OpensumiEditorState>;

  protected _editor?: IOpensumiEditor;
  get editor(): IOpensumiEditor | undefined {
    return this?._editor;
  }

  get monacoEditor(): IMonacoCodeEditor | undefined {
    return getOrigin(this?._editor)?.monacoEditor;
  }

  get lineCount(): number {
    return this.monacoEditor?.getModel()?.getLineCount() || 0;
  }

  protected onModelContentChangedEmitter = new Emitter<IModelContentChange[]>();
  onModelContentChanged = this.onModelContentChangedEmitter.event;

  lspProvider?: LSPProvider;

  completionProvider?: CompletionProvider;

  tooltipProvider?: TooltipProvider;

  protected isLayouting = false;

  protected hasHorizontalScrollbar = false;

  get eventbus() {
    return this.injector.get(IEventBus);
  }

  constructor(
    @inject(LibroOpensumiEditorOptions) options: LibroOpensumiEditorOptions,
    @inject(LibroOpensumiEditorState) state: LibroOpensumiEditorState,
    @inject(ThemeService) themeService: ThemeService,
    @inject(OpensumiInjector) injector: Injector,
    @inject(LanguageSpecRegistry)
    languageSpecRegistry: LanguageSpecRegistry,
  ) {
    this.themeService = themeService;
    this.languageSpecRegistry = languageSpecRegistry;
    this.injector = injector;
    this.host = options.host;
    this.host.classList.add('libro-opensumi-editor-container');
    this._uuid = options.uuid || v4();

    this._model = options.model;

    const config = options.config || {};
    const fullConfig = (this._config = {
      ...libroOpensumiEditorDefaultConfig,
      ...config,
      mimetype:
        options.model.mimeType === 'application/vnd.libro.sql+json'
          ? 'text/sql'
          : options.model.mimeType,
    });

    this.completionProvider = options.completionProvider;
    this.tooltipProvider = options.tooltipProvider;
    this.lspProvider = options.lspProvider;

    this.editorHost = document.createElement('div');
    this.host.append(this.editorHost);

    this.editorState = state;
    this.createEditor(this.editorHost, fullConfig);

    this.onMimeTypeChanged();
    this.onCursorActivity();

    this.toDispose.push(watch(this._model, 'mimeType', this.onMimeTypeChanged));
    // this.toDispose.push(watch(this._model, 'value', this.onValueChange));
    this.toDispose.push(
      watch(this._model, 'selections', this.onSelectionChange),
    );
    // this.toDispose.push(this.themeService.onDidColorThemeChange(this.onThemeChange));
  }

  get theme(): string {
    const themetype = this.themeService.getActiveTheme().type;
    return this._config.theme[themetype];
  }

  protected toMonacoOptions(
    editorConfig: Partial<LibroOpensumiEditorConfig>,
  ): MonacoEditorOptions {
    return {
      minimap: {
        enabled: false,
      },
      lineHeight: editorConfig.lineHeight ?? this.defaultLineHeight,
      // fontSize: editorConfig.fontSize ?? 13,
      lineNumbers: editorConfig.lineNumbers ? 'on' : 'off',
      // folding: editorConfig.codeFolding,
      wordWrap: editorConfig.lineWrap,
      renderLineHighlightOnlyWhenFocus: true,
      // lineDecorationsWidth: 15,
      // lineNumbersMinChars: 3,
      // suggestSelection: 'first',
      // wordBasedSuggestions: 'off',
      // lineDecorationsWidth: 15,
      // lineNumbersMinChars: 3,
      // suggestSelection: 'first',
      // wordBasedSuggestions: 'off',
      scrollBeyondLastLine: false,
      // overflowWidgetsDomNode: document.getElementById('monaco-editor-overflow-widgets-root')!,
      fixedOverflowWidgets: true,
      // suggest: { snippetsPreventQuickSuggestions: false },
      // autoClosingQuotes: editorConfig.autoClosingBrackets ? 'always' : 'never',
      // autoDetectHighContrast: false,
      // suggest: { snippetsPreventQuickSuggestions: false },
      // autoClosingQuotes: editorConfig.autoClosingBrackets ? 'always' : 'never',
      // autoDetectHighContrast: false,
      scrollbar: {
        alwaysConsumeMouseWheel: false,
        verticalScrollbarSize: 0,
      },
      glyphMargin: false,
      extraEditorClassName: OpensumiEditorClassname,
      // renderLineHighlight: 'all',
      // renderLineHighlightOnlyWhenFocus: true,
      // renderLineHighlight: 'all',
      // renderLineHighlightOnlyWhenFocus: true,
      readOnly: editorConfig.readOnly,
      // cursorWidth: 1,
      // tabSize: editorConfig.tabSize,
      // insertSpaces: editorConfig.insertSpaces,
      // matchBrackets: editorConfig.matchBrackets ? 'always' : 'never',
      // rulers: editorConfig.rulers,
      // wordWrapColumn: editorConfig.wordWrapColumn,
      // 'semanticHighlighting.enabled': true,
      // cursorWidth: 1,
      // tabSize: editorConfig.tabSize,
      // insertSpaces: editorConfig.insertSpaces,
      // matchBrackets: editorConfig.matchBrackets ? 'always' : 'never',
      // rulers: editorConfig.rulers,
      // wordWrapColumn: editorConfig.wordWrapColumn,
      // 'semanticHighlighting.enabled': true,
      maxTokenizationLineLength: 10000,
      wrappingStrategy: 'advanced',
      // hover: {
      //   enabled: true,
      // },
    };
  }

  getState(): EditorState<OpensumiEditorState> {
    const cursorPosition = this.getCursorPosition();
    const selections = this.getSelections();
    return {
      ...this.editorState,
      cursorPosition,
      selections,
    };
  }

  protected async createEditor(
    host: HTMLElement,
    config: LibroOpensumiEditorConfig,
  ) {
    if (!this.languageSpec) {
      return;
    }
    const editorConfig: LibroOpensumiEditorConfig = {
      ...config,
    };
    this._config = editorConfig;

    let modelRef = getOrigin(this.editorState.state);
    const options: MonacoEditorOptions = {
      ...this.toMonacoOptions(editorConfig),
    };

    const editorCollectionService: EditorCollectionService = this.injector.get(
      EditorCollectionService,
    );

    if (!modelRef) {
      const docModelService: IEditorDocumentModelService = this.injector.get(
        IEditorDocumentModelService,
      );
      const uri = URI.parse(this._uuid);
      modelRef = await getOrigin(docModelService).createModelReference(
        uri,
        'libro-opensumi-editor',
      );
    }
    this._editor = getOrigin(editorCollectionService).createCodeEditor(
      host,
      options,
    );

    getOrigin(this._editor).open(modelRef);

    this._editor.monacoEditor
      ?.getModel()
      ?.setLanguage(
        this.languageSpec.language === 'sql-odps'
          ? 'sql'
          : this.languageSpec.language,
      );

    this.toDispose.push(
      modelRef.instance.getMonacoModel()?.onDidChangeContent((e) => {
        const value = this.monacoEditor?.getValue();
        this.model.value = value ?? '';
        this.onModelContentChangedEmitter.fire(
          e.changes.map((item) => {
            return {
              range: this.toEditorRange(item.range),
              rangeLength: item.rangeLength,
              rangeOffset: item.rangeOffset,
              text: item.text,
            };
          }),
        );
      }) ?? Disposable.NONE,
    );
    this.toDispose.push(
      this.monacoEditor?.onDidContentSizeChange(() => {
        this.updateEditorSize();
      }) ?? Disposable.NONE,
    );
    this.toDispose.push(
      this.monacoEditor?.onDidBlurEditorText(() => {
        this.blur();
      }) ?? Disposable.NONE,
    );

    this.updateEditorSize();
    this.inspectResize();
    this.editorReadyDeferred.resolve();
  }

  protected inspectResize() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.updateEditorSize();
      }
    });
    this.intersectionObserver.observe(this.host);
  }

  protected getEditorNode() {
    return Array.from(
      this.host.getElementsByClassName(OpensumiEditorClassname),
    )[0] as HTMLDivElement;
  }

  protected updateEditorSize() {
    try {
      this.isLayouting = true;
      const contentHeight =
        this.monacoEditor?.getContentHeight() ?? this.defaultLineHeight;

      const lineHeight = this.getOption('lineHeight') ?? this.defaultLineHeight;

      if (contentHeight > this.lineCount * lineHeight) {
        this.hasHorizontalScrollbar = true;
      } else {
        this.hasHorizontalScrollbar = false;
      }
      if (this.editorContentHeight === contentHeight) {
        if (this.hasHorizontalScrollbar) {
          this.monacoEditor?.layout({
            height: contentHeight,
            width: this.host.offsetWidth,
          });
        }
        return;
      } else {
        this.editorContentHeight = contentHeight;
      }

      this.host.style.height = `${
        contentHeight +
        this.getOption('paddingTop') +
        this.getOption('paddingBottom')
      }px`;
      this.monacoEditor?.layout({
        width: this.host.offsetWidth,
        height: contentHeight,
      });
    } finally {
      this.isLayouting = false;
    }
  }

  protected onValueChange() {
    // this.editor?.codeEditor.setValue(this.model.value);
  }

  protected onSelectionChange() {
    this.setSelections(this.model.selections);
  }

  // protected onThemeChange = () => {
  //   this.monacoEditor?.updateOptions({ theme: this.theme });
  // };

  /**
   * Handles a mime type change.
   * 切换语言
   * cell 切换没走这里
   */
  protected onMimeTypeChanged(): void {
    const model = this.monacoEditor?.getModel();
    model?.setLanguage('');
    if (this.languageSpec && model) {
      setModelLanguage(model, this.languageSpec.language);
    }
  }

  get languageSpec() {
    return this.languageSpecRegistry.languageSpecs.find(
      (item) => item.mime === this.model.mimeType,
    );
  }
  /**
   * Handles a cursor activity event.
   */
  protected onCursorActivity(): void {
    // Only add selections if the editor has focus. This avoids unwanted
    // triggering of cursor activity due to collaborator actions.
    if (this.hasFocus()) {
      // const selections = this.getSelections();
      // this.model.selections = selections;
    }
  }

  getOption<K extends keyof LibroOpensumiEditorConfig>(option: K) {
    return this._config[option];
  }

  /**
   *
   * @param option
   * @param value
   */
  setOption = <K extends keyof LibroOpensumiEditorConfig>(
    option: K,
    value: LibroOpensumiEditorConfig[K],
  ) => {
    if (value === null || value === undefined) {
      return;
    }

    // if (option === 'theme') {
    //   this._config.theme = value as NonNullable<LibroE2EditorConfig['theme']>;
    //   this.monacoEditor?.updateOptions({
    //     theme: this.theme,
    //   });
    // }

    // if (option === 'placeholder') {
    //   this._config.placeholder = value as NonNullable<
    //     LibroE2EditorConfig['placeholder']
    //   >;
    //   this.placeholder.update(value as NonNullable<LibroE2EditorConfig['placeholder']>);
    // }

    const sizeKeys = [
      'fontFamily',
      'fontSize',
      'lineHeight',
      'wordWrapColumn',
      'lineWrap',
    ];
    const monacoOptionkeys = sizeKeys.concat([
      'readOnly',
      'insertSpaces',
      'tabSize',
    ]);

    if (monacoOptionkeys.includes(option)) {
      this._config = { ...this._config, [option]: value };

      this.monacoEditor?.updateOptions(this.toMonacoOptions(this._config));
    }

    if (sizeKeys.includes(option)) {
      this.updateEditorSize();
    }
  };

  getLine = (line: number) => {
    return this.monacoEditor?.getModel()?.getLineContent(line);
  };
  getOffsetAt = (position: IPosition) => {
    return (
      this.monacoEditor
        ?.getModel()
        ?.getOffsetAt({ lineNumber: position.line, column: position.column }) ||
      0
    );
  };
  undo = () => {
    this.monacoEditor?.trigger('source', 'undo', {});
  };

  redo = () => {
    this.monacoEditor?.trigger('source', 'redo', {});
  };
  focus = () => {
    window.requestAnimationFrame(() => {
      this.monacoEditor?.focus();
    });
  };
  hasFocus = () => {
    return this.monacoEditor?.hasWidgetFocus() ?? false;
  };
  blur = () => {
    document.documentElement.focus();
  };
  resizeToFit = () => {
    this.monacoEditor?.layout();
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getPositionForCoordinate = (coordinate: ICoordinate) => {
    return null;
  };

  protected modalChangeEmitter = new Emitter<boolean>();
  get onModalChange() {
    return this.modalChangeEmitter.event;
  }

  protected toMonacoRange(range: IRange) {
    const selection = range ?? this.getSelection();
    const monacoSelection = {
      startLineNumber: selection.start.line || 1,
      startColumn: selection.start.column || 1,
      endLineNumber: selection.end.line || 1,
      endColumn: selection.end.column || 1,
    };
    return monacoSelection;
  }

  protected toEditorRange(range: monacoTypes.IRange): IRange {
    return {
      start: {
        line: range.startLineNumber - 1,
        column: range.startColumn - 1,
      },
      end: {
        line: range.endLineNumber - 1,
        column: range.endColumn - 1,
      },
    };
  }

  getSelectionValue = (range?: IRange | undefined) => {
    const selection = range ?? this.getSelection();
    return this.monacoEditor
      ?.getModel()
      ?.getValueInRange(this.toMonacoRange(selection));
  };

  getPositionAt = (offset: number): IPosition | undefined => {
    const position = this.monacoEditor?.getModel()?.getPositionAt(offset);
    return position
      ? { line: position.lineNumber, column: position.column }
      : position;
  };

  protected toMonacoMatch(match: SearchMatch): monacoTypes.FindMatch {
    const start = this.getPositionAt(match.position);
    const end = this.getPositionAt(match.position + match.text.length);
    return {
      range: new MonacoRange(
        start?.line ?? 1,
        start?.column ?? 1,
        end?.line ?? 1,
        end?.column ?? 1,
      ),
      matches: [match.text],
      _findMatchBrand: undefined,
    };
  }

  replaceSelection = (text: string, range: IRange) => {
    this.monacoEditor?.executeEdits(undefined, [
      {
        range: this.toMonacoRange(range),
        text,
      },
    ]);
    this.monacoEditor?.pushUndoStop();
  };

  replaceSelections = (edits: { text: string; range: IRange }[]) => {
    this.monacoEditor?.executeEdits(
      undefined,
      edits.map((item) => ({
        range: this.toMonacoRange(item.range),
        text: item.text,
      })),
    );
    this.monacoEditor?.pushUndoStop();
  };

  getCursorPosition = () => {
    const position: IPosition = {
      line: this.monacoEditor?.getPosition()?.lineNumber || 1,
      column: this.monacoEditor?.getPosition()?.column || 1,
    };

    return position;
  };
  setCursorPosition = (position: IPosition) => {
    this.monacoEditor?.setPosition({
      column: position.column + 1,
      lineNumber: position.line + 1,
    });
  };
  getSelection = () => {
    const selection = {
      start: {
        line: this.monacoEditor?.getSelection()?.startLineNumber || 1,
        column: this.monacoEditor?.getSelection()?.startColumn || 1,
      } as IPosition,
      end: {
        line: this.monacoEditor?.getSelection()?.endLineNumber || 1,
        column: this.monacoEditor?.getSelection()?.endColumn || 1,
      } as IPosition,
    };
    return selection;
  };
  setSelection = (selection: IRange) => {
    this.monacoEditor?.setSelection(this.toMonacoRange(selection));
  };
  getSelections = () => {
    const selections: IRange[] = [];
    this.monacoEditor?.getSelections()?.map((selection: any) =>
      selections.push({
        start: {
          line: selection.startLineNumber || 1,
          column: selection.startColumn || 1,
        } as IPosition,
        end: {
          line: selection.endLineNumber || 1,
          column: selection.endColumn || 1,
        } as IPosition,
      }),
    );
    return selections;
  };
  setSelections = (selections: IRange[]) => {
    this.monacoEditor?.setSelections(
      selections.map<Selection>(
        (item) =>
          new Selection(
            item.start.line,
            item.start.column,
            item.end.line,
            item.end.column,
          ),
      ),
    );
  };

  revealSelection = (selection: IRange) => {
    this.monacoEditor?.revealRange(this.toMonacoRange(selection));
  };
  highlightMatches = (
    matches: SearchMatch[],
    currentIndex: number | undefined,
  ) => {
    let currentMatch: SearchMatch | undefined;
    const _matches: monacoTypes.IModelDeltaDecoration[] = matches
      .map((item, index) => {
        if (index === currentIndex) {
          currentMatch = item;
          return {
            range: item,
            options: {
              className: `currentFindMatch`, // 当前高亮
              description: '',
            },
          };
        }
        return {
          range: item,
          options: {
            className: `findMatch`, // 匹配高亮
            description: '',
          },
        };
      })
      .map((item) => ({
        ...item,
        range: this.toMonacoMatch(item.range).range,
      }));
    this.oldDeltaDecorations =
      this.monacoEditor?.deltaDecorations(this.oldDeltaDecorations, _matches) ||
      [];
    if (currentMatch) {
      const start = this.getPositionAt(currentMatch.position);
      const end = this.getPositionAt(
        currentMatch.position + currentMatch.text.length,
      );
      if (start && end) {
        this.revealSelection({ end, start });
      }
    }
  };

  format = () => {
    this.monacoEditor?.trigger(
      'libro-format',
      'editor.action.formatDocument',
      '',
    );
  };

  protected _isDisposed = false;
  /**
   * Tests whether the editor is disposed.
   */
  get disposed(): boolean {
    return this._isDisposed;
  }
  dispose = () => {
    if (this.disposed) {
      return;
    }
    this.disposeResizeObserver();
    this.toDispose.dispose();
    this._isDisposed = true;
  };

  disposeResizeObserver = () => {
    if (this.intersectionObserver) {
      getOrigin(this.intersectionObserver).disconnect();
    }
  };
}
