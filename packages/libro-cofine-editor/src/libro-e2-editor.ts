import type {
  CodeEditorFactory,
  CompletionProvider,
  ICoordinate,
  IEditor,
  IEditorConfig,
  IEditorOptions,
  IModel,
  IPosition,
  IRange,
  SearchMatch,
  TooltipProvider,
} from '@difizen/libro-code-editor';
import { defaultConfig } from '@difizen/libro-code-editor';
import type { E2Editor } from '@difizen/libro-cofine-editor-core';
import { EditorProvider, MonacoEnvironment } from '@difizen/libro-cofine-editor-core';
import { NotebookCommands } from '@difizen/libro-core';
import type { LSPProvider } from '@difizen/libro-lsp';
import {
  CommandRegistry,
  inject,
  ThemeService,
  transient,
  watch,
} from '@difizen/mana-app';
import { Disposable, DisposableCollection, Emitter } from '@difizen/mana-app';
import { editor, Selection } from '@difizen/monaco-editor-core';
import 'resize-observer-polyfill';
import { v4 } from 'uuid';

import { LSPContribution } from './language/lsp/lsp-contribution.js';
import { LanguageSpecRegistry } from './language-specs.js';
import { PlaceholderContentWidget } from './placeholder.js';
import type { MonacoEditorOptions, MonacoEditorType, MonacoMatch } from './types.js';
import { MonacoRange, MonacoUri } from './types.js';
import './index.less';

export interface LibroE2EditorConfig extends IEditorConfig {
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

  //
  highlightActiveLineGutter?: boolean;
  highlightSpecialChars?: boolean;
  history?: boolean;
  drawSelection?: boolean;
  dropCursor?: boolean;
  allowMultipleSelections?: boolean;
  autocompletion?: boolean;
  rectangularSelection?: boolean;
  crosshairCursor?: boolean;
  highlightSelectionMatches?: boolean;
  foldGutter?: boolean;
  syntaxHighlighting?: boolean;
  /**
   * 是否从kernel获取completion
   */
  jupyterKernelCompletion?: boolean;
  /**
   * 是否从kernel获取tooltip
   */
  jupyterKernelTooltip?: boolean;
  indentationMarkers?: boolean;
  hyperLink?: boolean;
  /**
   * 是否开启tab触发completion和tooltip
   */
  tabEditorFunction?: boolean;

  lspCompletion?: boolean;

  lspTooltip?: boolean;

  lspLint?: boolean;

  placeholder?: HTMLElement | string;
}

export const LibroE2EditorOptions = Symbol('LibroE2EditorOptions');

export interface LibroE2EditorOptions extends IEditorOptions {
  lspProvider?: LSPProvider;

  /**
   * The configuration options for the editor.
   */
  config?: Partial<LibroE2EditorConfig>;
}

export const libroE2DefaultConfig: Required<LibroE2EditorConfig> = {
  ...defaultConfig,
  theme: {
    dark: 'libro-dark',
    light: 'libro-light',
    hc: 'e2-hc',
  },
  scrollBarHeight: 12,
  mode: 'null',
  mimetype: 'text/x-python',
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
  lspEnabled: true,

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

export const LibroE2EditorFactory = Symbol('LibroE2EditorFactory');
export type LibroE2EditorFactory = CodeEditorFactory;

export const E2EditorClassname = 'libro-e2-editor';

export const LibroE2URIScheme = 'libro-e2';

@transient()
export class LibroE2Editor implements IEditor {
  protected readonly themeService: ThemeService;

  protected readonly languageSpecRegistry: LanguageSpecRegistry;
  @inject(CommandRegistry) protected readonly commandRegistry: CommandRegistry;
  @inject(LSPContribution) protected lspContribution: LSPContribution;

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

  protected placeholder: PlaceholderContentWidget;

  protected oldDeltaDecorations: string[] = [];

  protected _config: LibroE2EditorConfig;

  private resizeObserver: ResizeObserver;

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

  protected _editor?: E2Editor<MonacoEditorType>;
  get editor(): E2Editor<MonacoEditorType> | undefined {
    return this?._editor;
  }

  get monacoEditor(): MonacoEditorType | undefined {
    return this?._editor?.codeEditor;
  }

  get lineCount(): number {
    return this.monacoEditor?.getModel()?.getLineCount() || 0;
  }

  lspProvider?: LSPProvider;

  completionProvider?: CompletionProvider;

  tooltipProvider?: TooltipProvider;

  protected isLayouting = false;
  constructor(
    @inject(LibroE2EditorOptions) options: LibroE2EditorOptions,
    @inject(ThemeService) themeService: ThemeService,
    @inject(LanguageSpecRegistry)
    languageSpecRegistry: LanguageSpecRegistry,
  ) {
    this.themeService = themeService;
    this.languageSpecRegistry = languageSpecRegistry;
    this.host = options.host;
    this.host.classList.add('libro-e2-editor-container');
    this._uuid = options.uuid || v4();

    this._model = options.model;

    const config = options.config || {};
    const fullConfig = (this._config = {
      ...libroE2DefaultConfig,
      ...config,
      mimetype: options.model.mimeType,
    });

    this.completionProvider = options.completionProvider;
    this.tooltipProvider = options.tooltipProvider;
    this.lspProvider = options.lspProvider;

    this.editorHost = document.createElement('div');
    this.host.append(this.editorHost);

    this.createEditor(this.editorHost, fullConfig);

    this.onMimeTypeChanged();
    this.onCursorActivity();

    this.toDispose.push(watch(this._model, 'mimeType', this.onMimeTypeChanged));
    // this.toDispose.push(watch(this._model, 'source', this.onValueChange));
    this.toDispose.push(watch(this._model, 'selections', this.onSelectionChange));
    this.toDispose.push(this.themeService.onDidColorThemeChange(this.onThemeChange));
  }

  get languageSpec() {
    return this.languageSpecRegistry.languageSpecs.find(
      (item) => item.mime === this.model.mimeType,
    );
  }

  get theme(): string {
    const themetype = this.themeService.getActiveTheme().type;
    return this._config.theme[themetype];
  }

  protected toMonacoOptions(
    editorConfig: Partial<LibroE2EditorConfig>,
  ): MonacoEditorOptions {
    return {
      minimap: {
        enabled: false,
      },
      lineHeight: editorConfig.lineHeight ?? this.defaultLineHeight,
      fontSize: editorConfig.fontSize ?? 13,
      lineNumbers: editorConfig.lineNumbers ? 'on' : 'off',
      folding: editorConfig.codeFolding,
      wordWrap: editorConfig.lineWrap,
      lineDecorationsWidth: 15,
      lineNumbersMinChars: 3,
      suggestSelection: 'first',
      wordBasedSuggestions: 'off',
      scrollBeyondLastLine: false,
      /**
       * 使用该选项可以让modal widget出现在正确的范围，而不是被遮挡,解决z-index问题,但是会导致hover组件之类的无法被选中
       * 根据 https://github.com/microsoft/monaco-editor/issues/2156，0.34.x 版本修复了这个问题
       * TODO: 当前0.31.1 无法开启此选项，升级 E2 3.x 可以解决（monaco 0.39）
       *
       * ```html
       * <div id="monaco-editor-overflow-widgets-root" class="monaco-editor" style="z-index: 999;"></div>
       * ```
       *
       */
      // overflowWidgetsDomNode: document.getElementById('monaco-editor-overflow-widgets-root')!,
      // fixedOverflowWidgets: true,
      suggest: { snippetsPreventQuickSuggestions: false },
      autoClosingQuotes: editorConfig.autoClosingBrackets ? 'always' : 'never',
      autoDetectHighContrast: false,
      scrollbar: {
        alwaysConsumeMouseWheel: false,
        verticalScrollbarSize: 0,
      },
      extraEditorClassName: E2EditorClassname,
      renderLineHighlight: 'all',
      renderLineHighlightOnlyWhenFocus: true,
      readOnly: editorConfig.readOnly,
      cursorWidth: 1,
      tabSize: editorConfig.tabSize,
      insertSpaces: editorConfig.insertSpaces,
      matchBrackets: editorConfig.matchBrackets ? 'always' : 'never',
      rulers: editorConfig.rulers,
      wordWrapColumn: editorConfig.wordWrapColumn,
      'semanticHighlighting.enabled': true,
      maxTokenizationLineLength: 10000,
      // wrappingStrategy: 'advanced',
    };
  }

  protected async createEditor(host: HTMLElement, config: LibroE2EditorConfig) {
    if (!this.languageSpec) {
      return;
    }
    const editorConfig: LibroE2EditorConfig = {
      ...config,
      ...this.languageSpec.editorConfig,
    };
    this._config = editorConfig;
    // await this.languageSpec.loadModule()
    await MonacoEnvironment.init();
    await this.languageSpec?.beforeEditorInit?.();
    const editorPorvider =
      MonacoEnvironment.container.get<EditorProvider>(EditorProvider);

    const uri = MonacoUri.from({
      scheme: LibroE2URIScheme,
      path: `${this.uuid}${this.languageSpec.ext[0]}`,
    });

    const options: MonacoEditorOptions = {
      ...this.toMonacoOptions(editorConfig),
      /**
       * language ia an uri:
       */
      language: this.languageSpec.language,
      uri,
      theme: this.theme,
      value: this.model.value,
    };

    const e2Editor = editorPorvider.create(host, options);
    this._editor = e2Editor;
    this.toDispose.push(
      this.monacoEditor?.onDidChangeModelContent(() => {
        const value = this.monacoEditor?.getValue();
        this.model.value = value ?? '';
        // this.updateEditorSize();
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
    this.handleCommand(this.commandRegistry);
    await this.languageSpec?.afterEditorInit?.(this);
    this.placeholder = new PlaceholderContentWidget(
      config.placeholder,
      this.monacoEditor!,
    );

    // console.log(
    //   'editor._themeService.getColorTheme()',
    //   this.monacoEditor._themeService,
    //   this.monacoEditor._themeService.getColorTheme(),
    // );

    // setTimeout(() => {
    //   this.monacoEditor?.trigger('editor', 'editor.action.formatDocument');
    //   console.log('trigger format');
    // }, 5000);
  }

  protected inspectResize() {
    // this.resizeObserver = new ResizeObserver((entries) => {
    //   entries.forEach((entry) => {
    //     const isVisible =
    //       entry.contentRect.width !== 0 && entry.contentRect.height !== 0;
    //     if (isVisible) {
    //       this.updateEditorSize();
    //     }
    //   });
    // });
    // this.resizeObserver.observe(this.host);
  }

  protected getEditorNode() {
    return Array.from(
      this.host.getElementsByClassName(E2EditorClassname),
    )[0] as HTMLDivElement;
  }

  protected updateEditorSize() {
    try {
      this.isLayouting = true;
      const contentHeight =
        this.monacoEditor?.getContentHeight() ?? this.defaultLineHeight;
      if (this.editorContentHeight === contentHeight) {
        return;
      } else {
        this.editorContentHeight = contentHeight;
      }

      this.host.style.height = `${
        contentHeight + this.getOption('paddingTop') + this.getOption('paddingBottom')
      }px`;
      this.monacoEditor?.layout({
        width: this.host.offsetWidth,
        height: contentHeight,
      });
    } finally {
      this.isLayouting = false;
    }
  }

  /**
   * 解决e2与libro快捷键冲突
   * @param commandRegistry
   */
  protected handleCommand(commandRegistry: CommandRegistry) {
    // need monaco 0.34
    // editor.addKeybindingRules([
    //   {
    //     // disable show command center
    //     keybinding: KeyCode.F1,
    //     command: null,
    //   },
    //   {
    //     // disable show error command
    //     keybinding: KeyCode.F8,
    //     command: null,
    //   },
    //   {
    //     // disable toggle debugger breakpoint
    //     keybinding: KeyCode.F9,
    //     command: null,
    //   },
    this.monacoEditor?.addCommand(
      9,
      () => {
        commandRegistry.executeCommand(NotebookCommands['EnterCommandMode'].id);
      },
      '!editorHasSelection && !editorHasSelection && !editorHasMultipleSelections',
    );
    this.monacoEditor?.addCommand(
      2048 | 3,
      () => {
        commandRegistry.executeCommand(NotebookCommands['RunCell'].id);
      },
      '!findWidgetVisible && !referenceSearchVisible',
    );
    this.monacoEditor?.addCommand(
      1024 | 3,
      () => {
        commandRegistry.executeCommand(NotebookCommands['RunCellAndSelectNext'].id);
      },
      '!findInputFocussed',
    );
    this.monacoEditor?.addCommand(
      512 | 3,
      () => {
        commandRegistry.executeCommand(NotebookCommands['RunCellAndInsertBelow'].id);
      },
      '!findWidgetVisible',
    );

    this.monacoEditor?.addCommand(
      2048 | 1024 | 83,
      () => {
        commandRegistry.executeCommand(NotebookCommands['SplitCellAntCursor'].id);
      },
      // '!findWidgetVisible',
    );

    this.monacoEditor?.addCommand(
      2048 | 36,
      () => {
        commandRegistry.executeCommand('libro-search:toggle');
      },
      // '!findWidgetVisible',
    );
  }

  protected onValueChange() {
    // this.editor?.codeEditor.setValue(this.model.value);
  }

  protected onSelectionChange() {
    this.setSelections(this.model.selections);
  }

  protected onThemeChange = () => {
    this.monacoEditor?.updateOptions({ theme: this.theme });
  };

  /**
   * Handles a mime type change.
   * 切换语言
   * cell 切换没走这里
   */
  protected onMimeTypeChanged(): void {
    const model = this.monacoEditor?.getModel();
    if (this.languageSpec && model) {
      editor.setModelLanguage(model, this.languageSpec.language);
    }
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

  getOption<K extends keyof LibroE2EditorConfig>(option: K) {
    return this._config[option];
  }

  /**
   *
   * @param option
   * @param value
   */
  setOption = <K extends keyof LibroE2EditorConfig>(
    option: K,
    value: LibroE2EditorConfig[K],
  ) => {
    if (value === null || value === undefined) {
      return;
    }

    if (option === 'theme') {
      this._config.theme = value as NonNullable<LibroE2EditorConfig['theme']>;
      this.monacoEditor?.updateOptions({
        theme: this.theme,
      });
    }

    if (option === 'placeholder') {
      this._config.placeholder = value as NonNullable<
        LibroE2EditorConfig['placeholder']
      >;
      this.placeholder.update(value as NonNullable<LibroE2EditorConfig['placeholder']>);
    }

    if (option === 'lspEnabled') {
      this._config.lspEnabled = value as NonNullable<LibroE2EditorConfig['lspEnabled']>;
    }

    const sizeKeys = [
      'fontFamily',
      'fontSize',
      'lineHeight',
      'wordWrapColumn',
      'lineWrap',
    ];
    const monacoOptionkeys = sizeKeys.concat(['readOnly', 'insertSpaces', 'tabSize']);

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
        ?.getOffsetAt({ lineNumber: position.line, column: position.column }) || 0
    );
  };
  undo = () => {
    this.monacoEditor?.trigger('source', 'undo', {});
  };

  redo = () => {
    this.monacoEditor?.trigger('source', 'redo', {});
  };
  focus = () => {
    this.monacoEditor?.focus();
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

  getSelectionValue = (range?: IRange | undefined) => {
    const selection = range ?? this.getSelection();
    return this.monacoEditor
      ?.getModel()
      ?.getValueInRange(this.toMonacoRange(selection));
  };

  getPositionAt = (offset: number): IPosition | undefined => {
    const position = this.monacoEditor?.getModel()?.getPositionAt(offset);
    return position ? { line: position.lineNumber, column: position.column } : position;
  };

  protected toMonacoMatch(match: SearchMatch): MonacoMatch {
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
      edits.map((item) => ({ range: this.toMonacoRange(item.range), text: item.text })),
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
      column: position.column,
      lineNumber: position.line,
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
  highlightMatches = (matches: SearchMatch[], currentIndex: number | undefined) => {
    let currentMatch: SearchMatch | undefined;
    const _matches = matches
      .map((item, index) => {
        if (index === currentIndex) {
          currentMatch = item;
          return {
            range: item,
            options: {
              className: `currentFindMatch`, // 当前高亮
            },
          };
        }
        return {
          range: item,
          options: {
            className: `findMatch`, // 匹配高亮
          },
        };
      })
      .map((item) => ({
        ...item,
        range: this.toMonacoMatch(item.range).range,
      }));
    this.oldDeltaDecorations =
      this.monacoEditor?.deltaDecorations(this.oldDeltaDecorations, _matches) || [];
    if (currentMatch) {
      const start = this.getPositionAt(currentMatch.position);
      const end = this.getPositionAt(currentMatch.position + currentMatch.text.length);
      if (start && end) {
        this.revealSelection({ end, start });
      }
    }
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
    this.placeholder.dispose();
    this.disposeResizeObserver();
    this.disposeLSP();
    this.toDispose.dispose();
    this._isDisposed = true;
  };

  disposeLSP() {
    this.lspContribution.disposeLanguageFeature();
  }

  disposeResizeObserver = () => {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  };
}
