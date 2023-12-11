import type {
  CodeEditorViewOptions,
  IEditor,
  CodeEditorView,
} from '@difizen/libro-code-editor';
import { CodeEditorManager } from '@difizen/libro-code-editor';
import type { CellCollapsible, CellViewOptions } from '@difizen/libro-core';
import { CellService, EditorStatus, LibroEditorCellView } from '@difizen/libro-core';
import { MarkdownParser } from '@difizen/libro-markdown';
import type { ViewSize } from '@difizen/mana-app';
import { getOrigin, prop, useInject, watch } from '@difizen/mana-app';
import {
  view,
  ViewInstance,
  ViewManager,
  ViewOption,
  ViewRender,
} from '@difizen/mana-app';
import { inject, transient } from '@difizen/mana-app';
import { forwardRef, useEffect } from 'react';

import './index.less';
import type { MarkdownCellModel } from './markdown-cell-model.js';
import { MarkdownPreview } from './markdown-preview.js';

export const MarkdownCell = forwardRef<HTMLDivElement>(
  function MarkdownCell(props, ref) {
    const instance = useInject<MarkdownCellView>(ViewInstance);
    const isEdit = instance.isEdit;
    useEffect(() => {
      if (instance.editorView?.editor) {
        instance.editor = getOrigin(instance.editorView?.editor);
      }
    }, [instance, instance.editorView?.editor]);

    useEffect(() => {
      if (instance.cellmodel.isEdit) {
        instance.createEditor();
      }
    }, [instance, instance.cellmodel.isEdit]);

    return (
      <div
        ref={ref}
        tabIndex={10}
        onBlur={(e) => {
          if (typeof ref !== 'function' && !ref?.current?.contains(e.relatedTarget)) {
            instance.blur();
          }
        }}
        className={instance.className}
      >
        {isEdit && instance.editorView ? (
          <ViewRender view={instance.editorView} />
        ) : (
          <MarkdownPreview instance={instance} />
        )}
      </div>
    );
  },
);

@transient()
@view('libro-markdown-cell-view')
export class MarkdownCellView extends LibroEditorCellView implements CellCollapsible {
  override get wrapperCls() {
    if (!this.cellmodel.isEdit) {
      return 'markdown-cell-preview';
    }
    return '';
  }
  override view = MarkdownCell;

  viewManager: ViewManager;

  codeEditorManager: CodeEditorManager;

  @prop()
  editorView?: CodeEditorView;

  @prop()
  editorAreaHeight = 0;

  @prop()
  override noEditorAreaHeight = 0;

  declare editor: IEditor | undefined;

  @prop()
  headingCollapsed = false;

  @prop()
  collapsibleChildNumber = 0;

  @prop()
  override editorStatus: EditorStatus = EditorStatus.NOTLOADED;

  get isEdit() {
    return (
      this.editorView?.view && this.cellmodel.isEdit && !this.parent.model.readOnly
    );
  }

  get cellmodel() {
    return this.model as MarkdownCellModel;
  }

  markdownParser: MarkdownParser;

  constructor(
    @inject(ViewOption) options: CellViewOptions,
    @inject(CellService) cellService: CellService,
    @inject(ViewManager) viewManager: ViewManager,
    @inject(CodeEditorManager) codeEditorManager: CodeEditorManager,
    @inject(MarkdownParser) markdownParser: MarkdownParser,
  ) {
    super(options, cellService);
    this.viewManager = viewManager;
    this.codeEditorManager = codeEditorManager;
    this.markdownParser = markdownParser;
    this.className = this.className + ' markdown';
  }

  override onViewMount() {
    if (this.cellmodel.isEdit) {
      this.createEditor();
    }
    watch(this.parent.model, 'readOnly', () => {
      if (this.parent.model.readOnly === true) {
        this.cellmodel.isEdit = false;
      }
    });
  }

  override onViewResize(size: ViewSize) {
    if (size.height) {
      this.editorAreaHeight = size.height;
    }
  }

  calcEditorAreaHeight() {
    return this.editorAreaHeight;
  }

  protected getEditorOption(): CodeEditorViewOptions {
    const option: CodeEditorViewOptions = {
      model: this.model,
      config: {
        lineNumbers: false,
        foldGutter: false,
        lineWrap: 'on',
        matchBrackets: false,
        autoClosingBrackets: false,
      },
      autoFocus: true,
    };
    return option;
  }

  async createEditor() {
    const option = this.getEditorOption();

    this.editorStatus = EditorStatus.LOADING;

    // 防止虚拟滚动中编辑器被频繁创建
    if (this.editorView) {
      this.editorStatus = EditorStatus.LOADED;
      return;
    }

    const editorView = await this.codeEditorManager.getOrCreateEditorView(option);

    this.editorView = editorView;
    await editorView.editorReady;

    this.editorStatus = EditorStatus.LOADED;

    await this.afterEditorReady();
  }

  protected async afterEditorReady() {
    getOrigin(this.editorView)?.editor.focus();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override shouldEnterEditorMode(e: React.FocusEvent<HTMLElement>) {
    if (!this.cellmodel.isEdit) {
      return false;
    }
    return true;
  }

  override focus(toEdit: boolean) {
    if (toEdit) {
      this.cellmodel.isEdit = true;
    } else {
      if (this.container?.current?.parentElement?.contains(document.activeElement)) {
        return;
      }
      this.container?.current?.parentElement?.focus();
    }
  }

  override blur() {
    this.cellmodel.isEdit = false;
  }

  override redo(): void {
    // this.editor?.trigger('', 'redo', '');
    // this.editor?.focus();
  }

  override undo(): void {
    // this.editor?.trigger('undo', 'undo', {});
    // this.editor?.focus();
  }
}
