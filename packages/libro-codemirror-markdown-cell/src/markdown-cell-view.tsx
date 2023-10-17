import { CodeEditorView } from '@difizen/libro-code-editor';
import type {
  CodeEditorViewOptions,
  IEditor,
  IRange,
} from '@difizen/libro-code-editor';
import { codeMirrorEditorFactory } from '@difizen/libro-codemirror';
import type { CellCollapsible, CellViewOptions } from '@difizen/libro-core';
import { CellService, LibroEditorCellView } from '@difizen/libro-core';
import { MarkdownParser } from '@difizen/libro-markdown';
import { getOrigin, prop, useInject, watch } from '@difizen/mana-app';
import {
  ViewManager,
  ViewOption,
  ViewRender,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { inject, transient } from '@difizen/mana-app';
import { forwardRef, useEffect } from 'react';

import type { MarkdownCellModel } from './markdown-cell-model.js';
import { MarkdownPreview } from './markdown-preview.js';
import './index.less';

export const MarkdownCell = forwardRef<HTMLDivElement>(
  function MarkdownCell(_props, ref) {
    const instance = useInject<MarkdownCellView>(ViewInstance);
    const isEdit =
      instance.editorView?.view &&
      instance.cellmodel.isEdit &&
      !instance.parent.model.readOnly;
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
          <MarkdownPreview />
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

  @prop()
  editorView?: CodeEditorView;

  override editor: IEditor | undefined = undefined;

  @prop()
  headingCollapsed = false;

  @prop()
  collapsibleChildNumber = 0;

  get cellmodel() {
    return this.model as MarkdownCellModel;
  }

  markdownParser: MarkdownParser;

  constructor(
    @inject(ViewOption) options: CellViewOptions,
    @inject(CellService) cellService: CellService,
    @inject(ViewManager) viewManager: ViewManager,
    @inject(MarkdownParser) markdownParser: MarkdownParser,
  ) {
    super(options, cellService);
    this.viewManager = viewManager;
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

  async createEditor() {
    const option: CodeEditorViewOptions = {
      factory: codeMirrorEditorFactory,
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
    const editorView = await this.viewManager.getOrCreateView<
      CodeEditorView,
      CodeEditorViewOptions
    >(CodeEditorView, option);

    this.editorView = editorView;

    await editorView.editorReady;
    editorView?.editor?.focus();

    return editorView;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override shouldEnterEditorMode(_e: React.FocusEvent<HTMLElement>) {
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

  getSelections = (): IRange[] => {
    return this.editor?.getSelections() ?? [];
  };

  getSelectionsOffsetAt = (selection: IRange) => {
    const isSelect = selection;
    const start = this.editor?.getOffsetAt(isSelect.start) ?? 0;
    const end = this.editor?.getOffsetAt(isSelect.end) ?? 0;
    return { start: start, end: end };
  };
}
