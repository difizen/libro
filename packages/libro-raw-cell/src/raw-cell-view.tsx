/* eslint-disable @typescript-eslint/no-parameter-properties */
/* eslint-disable @typescript-eslint/parameter-properties */
import type { CodeEditorViewOptions, CodeEditorView } from '@difizen/libro-code-editor';
import { CodeEditorManager } from '@difizen/libro-code-editor';
import type { CellViewOptions } from '@difizen/libro-core';
import { CellService, LibroEditorCellView, LibroContextKey } from '@difizen/libro-core';
import { getOrigin, prop, useInject, watch } from '@difizen/mana-app';
import {
  view,
  ViewInstance,
  ViewManager,
  ViewOption,
  ViewRender,
} from '@difizen/mana-app';
import { inject, transient } from '@difizen/mana-app';
import React, { useEffect } from 'react';

import type { LibroRawCellModel } from './raw-cell-model.js';

const CellEditor: React.FC = () => {
  const instance = useInject<LibroRawCellView>(ViewInstance);
  useEffect(() => {
    if (instance.editorView?.editor) {
      instance.editor = getOrigin(instance.editorView?.editor);
    }
  }, [instance, instance.editorView?.editor]);
  return <>{instance.editorView && <ViewRender view={instance.editorView} />}</>;
};

const CellEditorMemo = React.memo(CellEditor);

const CodeEditorViewComponent = React.forwardRef<HTMLDivElement>(
  function CodeEditorViewComponent(props, ref) {
    const instance = useInject<LibroRawCellView>(ViewInstance);
    return (
      <div className={instance.className} ref={ref}>
        <CellEditorMemo />
      </div>
    );
  },
);

@transient()
@view('raw-cell-view')
export class LibroRawCellView extends LibroEditorCellView {
  @inject(LibroContextKey) protected readonly libroContextKey: LibroContextKey;
  declare model: LibroRawCellModel;
  override view = CodeEditorViewComponent;

  viewManager: ViewManager;

  codeEditorManager: CodeEditorManager;

  @prop()
  editorView?: CodeEditorView;

  constructor(
    @inject(ViewOption) options: CellViewOptions,
    @inject(CellService) cellService: CellService,
    @inject(ViewManager) viewManager: ViewManager,
    @inject(CodeEditorManager) codeEditorManager: CodeEditorManager,
  ) {
    super(options, cellService);
    this.viewManager = viewManager;
    this.className = this.className + ' raw';
    this.codeEditorManager = codeEditorManager;
  }

  override onViewMount() {
    this.createEditor();
    //选中cell时才focus
    if (this.parent.model.active?.id === this.id) {
      this.focus(!this.parent.model.commandMode);
    }
  }

  protected getEditorOption(): CodeEditorViewOptions {
    const option: CodeEditorViewOptions = {
      uuid: `${this.parent.model.id}-${this.model.id}`,
      editorHostId: this.parent.id + this.id,
      model: this.model,
      config: {
        readOnly: !this.parent.model.inputEditable,
        editable: this.parent.model.inputEditable,
        lineNumbers: false,
        foldGutter: false,
        lineWrap: 'on',
        matchBrackets: false,
        autoClosingBrackets: false,
      },
    };
    return option;
  }

  async createEditor() {
    const option = this.getEditorOption();

    const editorView = await this.codeEditorManager.getOrCreateEditorView(option);

    this.editorView = editorView;
    await this.afterEditorReady();
  }

  protected async afterEditorReady() {
    watch(this.parent.model, 'inputEditable', () => {
      this.editorView?.editor.setOption('readOnly', !this.parent.model.inputEditable);
    });
  }

  override shouldEnterEditorMode(e: React.FocusEvent<HTMLElement>) {
    return getOrigin(this.editorView)?.editor?.host?.contains(
      e.target as HTMLElement,
    ) && this.parent.model.commandMode
      ? true
      : false;
  }

  override blur = () => {
    //
  };

  protected focusEditor() {
    //选中cell、编辑模式、非只读时才focus
    if (
      this.editorView?.editor &&
      this.editorView.editorStatus === 'ready' &&
      this.parent.model.active?.id === this.id &&
      !this.parent.model.commandMode &&
      this.libroContextKey.commandModeEnabled === true && // 排除弹窗等情况
      this.parent.model.inputEditable
    ) {
      this.editorView?.editor.setOption('styleActiveLine', true);
      this.editorView?.editor.setOption('highlightActiveLineGutter', true);
      this.editorView?.editor.focus();
    }
  }

  override focus = (toEdit: boolean) => {
    if (toEdit) {
      this.focusEditor();
    } else {
      if (this.container?.current?.parentElement?.contains(document.activeElement)) {
        return;
      }
      this.container?.current?.parentElement?.focus();
    }
  };
}
