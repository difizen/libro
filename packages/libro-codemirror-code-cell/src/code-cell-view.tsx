/* eslint-disable @typescript-eslint/no-parameter-properties */
/* eslint-disable @typescript-eslint/parameter-properties */
import { CodeEditorView } from '@difizen/libro-code-editor';
import type { CodeEditorViewOptions, IRange } from '@difizen/libro-code-editor';
import { CodeMirrorEditor, codeMirrorEditorFactory } from '@difizen/libro-codemirror';
import type { ICodeCell, IOutput } from '@difizen/libro-common';
import { isOutput } from '@difizen/libro-common';
import type {
  IOutputAreaOption,
  LibroCell,
  CellViewOptions,
} from '@difizen/libro-core';
import {
  CellService,
  LibroExecutableCellView,
  LibroOutputArea,
} from '@difizen/libro-core';
import { Deferred } from '@difizen/mana-app';
import { getOrigin, prop, useInject, watch } from '@difizen/mana-app';
import { inject, transient } from '@difizen/mana-app';
import {
  view,
  ViewInstance,
  ViewManager,
  ViewOption,
  ViewRender,
} from '@difizen/mana-app';
import { forwardRef, memo } from 'react';
import React, { useEffect } from 'react';

import type { LibroCodeCellModel } from './code-cell-model.js';

const CellEditor: React.FC = () => {
  const instance = useInject<LibroCodeCellView>(ViewInstance);
  useEffect(() => {
    if (instance.editorView?.editor) {
      instance.editor = getOrigin(instance.editorView?.editor);
    }
  }, [instance, instance.editorView?.editor]);
  return <>{instance.editorView && <ViewRender view={instance.editorView} />}</>;
};

export const CellEditorMemo = memo(CellEditor);

const CodeEditorViewComponent = forwardRef<HTMLDivElement>(
  function CodeEditorViewComponent(_props, ref) {
    const instance = useInject<LibroCodeCellView>(ViewInstance);
    return (
      <div
        className="libro-codemirror-cell-editor"
        ref={ref}
        tabIndex={10}
        onBlur={instance.blur}
      >
        <CellEditorMemo />
      </div>
    );
  },
);

@transient()
@view('code-editor-cell-view')
export class LibroCodeCellView extends LibroExecutableCellView {
  override view = CodeEditorViewComponent;

  viewManager: ViewManager;

  outputs: IOutput[];

  @prop()
  editorView?: CodeEditorView;

  protected outputAreaDeferred = new Deferred<LibroOutputArea>();
  get outputAreaReady() {
    return this.outputAreaDeferred.promise;
  }

  protected editorViewReadyDeferred: Deferred<void> = new Deferred<void>();

  get editorReady() {
    return this.editorViewReadyDeferred.promise;
  }

  constructor(
    @inject(ViewOption) options: CellViewOptions,
    @inject(CellService) cellService: CellService,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    super(options, cellService);
    this.options = options;
    this.viewManager = viewManager;

    this.outputs = options.cell?.outputs as IOutput[];
    this.className = this.className + ' code';

    // 创建outputArea
    this.viewManager
      .getOrCreateView<LibroOutputArea, IOutputAreaOption>(LibroOutputArea, {
        cellId: this.id,
        cell: this,
      })
      .then(async (outputArea) => {
        this.outputArea = outputArea;
        const output = this.outputs;
        if (isOutput(output)) {
          await this.outputArea.fromJSON(output);
        }
        this.outputAreaDeferred.resolve(outputArea);
        this.outputWatch();
        return;
      })
      .catch(() => {
        //
      });
  }

  override outputWatch() {
    this.toDispose.push(
      watch(this.outputArea, 'outputs', () => {
        this.parent.model.onChange?.();
      }),
    );
  }

  override toJSON(): LibroCell {
    const meta = super.toJSON();
    return {
      ...meta,
      outputs: this.outputArea?.toJSON() ?? this.outputs,
    } as ICodeCell;
  }

  override onViewMount() {
    this.createEditor();
    //选中cell时才focus
    if (this.parent.model.active?.id === this.id) {
      this.focus(!this.parent.model.commandMode);
    }
  }

  createEditor() {
    const option: CodeEditorViewOptions = {
      factory: (editorOption) =>
        codeMirrorEditorFactory({
          ...editorOption,
          config: {
            ...editorOption.config,
            ...{ readOnly: this.parent.model.readOnly },
          },
        }),
      model: this.model,
      config: {
        readOnly: this.parent.model.readOnly,
        editable: !this.parent.model.readOnly,
      },
    };
    this.viewManager
      .getOrCreateView<CodeEditorView, CodeEditorViewOptions>(CodeEditorView, option)
      .then((editorView) => {
        this.editorView = editorView;
        this.editorViewReadyDeferred.resolve();
        watch(this.parent.model, 'readOnly', () => {
          this.editorView?.editor?.setOption('readOnly', this.parent.model.readOnly);
          if (this.editorView?.editor instanceof CodeMirrorEditor) {
            this.editorView?.editor.setOption('placeholder', '请输入代码');
          }
        });
        return;
      })
      .catch(() => {
        //
      });
  }

  override shouldEnterEditorMode(e: React.FocusEvent<HTMLElement>) {
    return getOrigin(this.editorView)?.editor?.host?.contains(e.target as HTMLElement)
      ? true
      : false;
  }

  override blur = () => {
    this.editorView?.editor?.setOption('styleActiveLine', false);
    this.editorView?.editor?.setOption('highlightActiveLineGutter', false);
  };

  override focus = (toEdit: boolean) => {
    if (toEdit) {
      if (this.parent.model.readOnly === true) {
        return;
      }
      if (!this.editorView) {
        this.editorReady
          .then(async () => {
            await this.editorView?.editorReady;
            this.editorView?.editor?.setOption('styleActiveLine', true);
            this.editorView?.editor?.setOption('highlightActiveLineGutter', true);
            if (this.editorView?.editor?.hasFocus()) {
              return;
            }
            this.editorView?.editor?.focus();
            return;
          })
          .catch(() => {
            //
          });
      } else {
        if (!this.editorView?.editor) {
          return;
        }
        this.editorView.editor.setOption('styleActiveLine', true);
        this.editorView.editor.setOption('highlightActiveLineGutter', true);
        if (this.editorView.editor.hasFocus()) {
          return;
        }
        this.editorView.editor.focus();
      }
    } else {
      if (this.container?.current?.parentElement?.contains(document.activeElement)) {
        return;
      }
      this.container?.current?.parentElement?.focus();
    }
  };

  override clearExecution = () => {
    (this.model as LibroCodeCellModel).clearExecution();
    this.outputArea.clear();
  };

  override getSelections = (): [] => {
    return this.editor?.getSelections() as [];
  };

  override getSelectionsOffsetAt = (selection: IRange) => {
    const isSelect = selection;
    const start = this.editor?.getOffsetAt(isSelect.start) ?? 0;
    const end = this.editor?.getOffsetAt(isSelect.end) ?? 0;
    return { start: start, end: end };
  };
}
