// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { getOrigin, prop } from '@difizen/mana-app';
import {
  inject,
  transient,
  Deferred,
  Emitter,
  BaseView,
  ThemeService,
  view,
  ViewOption,
} from '@difizen/mana-app';
import { forwardRef, memo } from 'react';

import { CodeEditorInfoManager } from './code-editor-info-manager.js';
import type { CodeEditorFactory } from './code-editor-manager.js';
import type { IModel } from './code-editor-model.js';
import type {
  CompletionProvider,
  ICoordinate,
  IEditorConfig,
  IEditorSelectionStyle,
  TooltipProvider,
} from './code-editor-protocol.js';
import type { IEditor } from './code-editor-protocol.js';
import { CodeEditorSettings } from './code-editor-settings.js';

export const CodeEditorRender = memo(
  forwardRef<HTMLDivElement>((props, ref) => {
    return <div ref={ref} />;
  }),
);

/**
 * The class name added to an editor widget that has a primary selection.
 */
const HAS_SELECTION_CLASS = 'jp-mod-has-primary-selection';

/**
 * The class name added to an editor widget that has a cursor/selection
 * within the whitespace at the beginning of a line
 */
const HAS_IN_LEADING_WHITESPACE_CLASS = 'jp-mod-in-leading-whitespace';

/**
 * A class used to indicate a drop target.
 */
const DROP_TARGET_CLASS = 'jp-mod-dropTarget';

/**
 * RegExp to test for leading whitespace
 */
const leadingWhitespaceRe = /^\s+$/;

/**
 * A widget which hosts a code editor.
 */
@transient()
@view('code-editor-view')
export class CodeEditorView extends BaseView {
  @inject(ThemeService) protected readonly themeService: ThemeService;
  @inject(CodeEditorSettings) protected readonly codeEditorSettings: CodeEditorSettings;

  codeEditorInfoManager: CodeEditorInfoManager;

  override view = CodeEditorRender;

  protected classlist: string[] = [];

  protected options: CodeEditorViewOptions;

  protected modalChangeEmitter = new Emitter();

  protected editorHostRef: any;

  get onModalChange() {
    return this.modalChangeEmitter.event;
  }

  /**
   * Get the editor wrapped by the widget.
   */
  @prop()
  editor: IEditor;
  protected editorReadyDeferred: Deferred<void> = new Deferred<void>();
  get editorReady() {
    return this.editorReadyDeferred.promise;
  }
  /**
   * Construct a new code editor widget.
   */
  constructor(
    @inject(ViewOption) options: CodeEditorViewOptions,
    @inject(CodeEditorInfoManager) codeEditorInfoManager: CodeEditorInfoManager,
  ) {
    super();
    this.options = options;
    this.codeEditorInfoManager = codeEditorInfoManager;
  }

  override async onViewMount() {
    const settings = this.codeEditorSettings.getUserEditorSettings();

    const editorHostId = this.options.editorHostId;
    const editorHostRef = editorHostId
      ? this.codeEditorInfoManager.getEditorHostRef(editorHostId)
      : undefined;

    this.editorHostRef =
      editorHostRef && editorHostRef.current ? editorHostRef : this.container;

    if (this.editorHostRef.current && this.options.factory) {
      this.editor = this.options.factory({
        ...this.options,
        host: this.editorHostRef.current,
        model: this.options.model,
        uuid: this.options.uuid,
        config: { ...settings, ...this.options.config },
        selectionStyle: this.options.selectionStyle,
        tooltipProvider: this.options.tooltipProvider,
        completionProvider: this.options.completionProvider,
      });
      this.editorReadyDeferred.resolve();
      this.editor.onModalChange((val) => this.modalChangeEmitter.fire(val));
      // this.editor.model.selections.changed(this._onSelectionsChanged);

      if (this.options.autoFocus) {
        getOrigin(this.editor).focus();
      }

      this.editorHostRef.current.addEventListener('focus', this.onViewActive);
      this.editorHostRef.current.addEventListener('dragenter', this._evtDragEnter);
      this.editorHostRef.current.addEventListener('dragleave', this._evtDragLeave);
      this.editorHostRef.current.addEventListener('dragover', this._evtDragOver);
      this.editorHostRef.current.addEventListener('drop', this._evtDrop);

      this.toDispose.push(
        this.codeEditorSettings.onCodeEditorSettingsChange((e) => {
          this.editor.setOption(e.key, e.value);
        }),
      );
    }
  }

  removeChildNodes = (parent: any) => {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  };

  override onViewUnmount = () => {
    if (this.editor.dispose) {
      this.editor.dispose();
    }

    const node = this.editorHostRef?.current;
    if (node) {
      node.removeEventListener('focus', this.onViewActive);
      node.removeEventListener('dragenter', this._evtDragEnter);
      node.removeEventListener('dragleave', this._evtDragLeave);
      node.removeEventListener('dragover', this._evtDragOver);
      node.removeEventListener('drop', this._evtDrop);

      this.removeChildNodes(node);
    }
  };

  override onViewResize() {
    this.editor?.resizeToFit();
  }

  /**
   * Get the model used by the widget.
   */
  get model(): IModel {
    return this.editor.model;
  }

  /**
   * Dispose of the resources held by the widget.
   */
  override dispose(): void {
    if (this.isDisposed) {
      return;
    }
    super.dispose();
    this.editor.dispose();
  }

  protected onViewActive = (): void => {
    this.editor.focus();
  };

  /**
   * A message handler invoked on a `'resize'` message.
   */
  protected onResize(): void {
    if (this.isVisible) {
      this.editor.resizeToFit();
    }
  }

  addClass(classname: string) {
    this.classlist.push(classname);
  }

  removeClass(classname: string) {
    const index = this.classlist.indexOf(classname);
    if (index >= 0) {
      this.classlist.splice(index, 1);
    }
  }

  /**
   * Handle a change in model selections.
   */
  protected _onSelectionsChanged(): void {
    const { start, end } = this.editor.getSelection();

    if (start.column !== end.column || start.line !== end.line) {
      // a selection was made
      this.addClass(HAS_SELECTION_CLASS);
      this.removeClass(HAS_IN_LEADING_WHITESPACE_CLASS);
    } else {
      // the cursor was placed
      this.removeClass(HAS_SELECTION_CLASS);

      if (
        this.editor.getLine(end.line)!.slice(0, end.column).match(leadingWhitespaceRe)
      ) {
        this.addClass(HAS_IN_LEADING_WHITESPACE_CLASS);
      } else {
        this.removeClass(HAS_IN_LEADING_WHITESPACE_CLASS);
      }
    }
  }

  /**
   * Handle the `'lm-dragenter'` event for the widget.
   */
  protected _evtDragEnter = (event: DragEvent): void => {
    if (this.editor.getOption('readOnly') === true) {
      return;
    }
    const data = findTextData(event);
    if (data === undefined) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.addClass('jp-mod-dropTarget');
  };

  /**
   * Handle the `'lm-dragleave'` event for the widget.
   */
  protected _evtDragLeave = (event: DragEvent): void => {
    this.removeClass(DROP_TARGET_CLASS);
    if (this.editor.getOption('readOnly') === true) {
      return;
    }
    const data = findTextData(event);
    if (data === undefined) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };

  /**
   * Handle the `'lm-dragover'` event for the widget.
   */
  protected _evtDragOver = (event: DragEvent): void => {
    this.removeClass(DROP_TARGET_CLASS);
    if (this.editor.getOption('readOnly') === true) {
      return;
    }
    const data = findTextData(event);
    if (data === undefined) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'copy';
    this.addClass(DROP_TARGET_CLASS);
  };

  /**
   * Handle the `'lm-drop'` event for the widget.
   */
  protected _evtDrop = (event: DragEvent): void => {
    if (this.editor.getOption('readOnly') === true) {
      return;
    }
    const data = findTextData(event);
    if (data === undefined) {
      return;
    }
    const coordinate = {
      top: event.y,
      bottom: event.y,
      left: event.x,
      right: event.x,
      x: event.x,
      y: event.y,
      width: 0,
      height: 0,
    } as ICoordinate;
    const position = this.editor.getPositionForCoordinate(coordinate);
    if (position === null) {
      return;
    }
    this.removeClass(DROP_TARGET_CLASS);
    event.preventDefault();
    event.stopPropagation();
    // if (event.proposedAction === 'none') {
    //   event.dropAction = 'none';
    //   return;
    // }
    // const offset = this.editor.getOffsetAt(position);
    // this.model.value.insert(offset, data);
  };
}

/**
 * The namespace for the `CodeEditorWrapper` statics.
 */
/**
 * The options used to initialize a code editor widget.
 */
export interface CodeEditorViewOptions<Config extends IEditorConfig = IEditorConfig> {
  /**
   * A code editor factory.
   *
   * #### Notes
   * The widget needs a factory and a model instead of a `CodeEditor.IEditor`
   * object because it needs to provide its own node as the host.
   */
  factory?: CodeEditorFactory;

  /**
   * where to mount the editor
   */
  editorHostId?: string;

  /**
   * The model used to initialize the code editor.
   */
  model: IModel;

  /**
   * The desired uuid for the editor.
   */
  uuid?: string;

  /**
   * The configuration options for the editor.
   */
  config?: Partial<Config>;

  /**
   * The default selection style for the editor.
   */
  selectionStyle?: IEditorSelectionStyle;

  tooltipProvider?: TooltipProvider;
  completionProvider?: CompletionProvider;

  autoFocus?: boolean;

  [key: string]: any;
}

/**
 * Given a MimeData instance, extract the first text data, if any.
 */
function findTextData(event: DragEvent): string | undefined {
  const items = event.dataTransfer?.items;
  if (!items) {
    return;
  }
  const textTypeItem = Array.from(items).find((t) => t.type.indexOf('text') === 0);
  if (textTypeItem === undefined) {
    return undefined;
  }
  return event.dataTransfer.getData(textTypeItem.type);
}
