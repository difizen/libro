/* eslint-disable @typescript-eslint/no-parameter-properties */
/* eslint-disable @typescript-eslint/parameter-properties */
import type { CodeEditorViewOptions, IRange } from '@difizen/libro-code-editor';
import { CodeEditorView } from '@difizen/libro-code-editor';
import { codeMirrorEditorFactory } from '@difizen/libro-codemirror';
import type { CellViewOptions } from '@difizen/libro-core';
import { CellService, LibroEditorCellView } from '@difizen/libro-core';
import { inject, transient } from '@difizen/mana-app';
import {
  view,
  ViewInstance,
  ViewManager,
  ViewOption,
  ViewRender,
} from '@difizen/mana-app';
import { Deferred } from '@difizen/mana-app';
import { getOrigin, prop, useInject, watch } from '@difizen/mana-app';
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
  function CodeEditorViewComponent(_props, ref) {
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
  declare model: LibroRawCellModel;
  override view = CodeEditorViewComponent;

  viewManager: ViewManager;

  @prop()
  editorView?: CodeEditorView;

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
    this.viewManager = viewManager;
    this.className = this.className + ' raw';
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
      factory: codeMirrorEditorFactory,
      model: this.model,
      config: {
        readOnly: this.parent.model.readOnly,
        editable: !this.parent.model.readOnly,
        lineNumbers: false,
        foldGutter: false,
        lineWrap: 'on',
        matchBrackets: false,
        autoClosingBrackets: false,
      },
    };
    this.viewManager
      .getOrCreateView<CodeEditorView, CodeEditorViewOptions>(CodeEditorView, option)
      .then((editorView) => {
        this.editorView = editorView;
        this.editorViewReadyDeferred.resolve();
        watch(this.parent.model, 'readOnly', () => {
          this.editorView?.editor?.setOption('readOnly', this.parent.model.readOnly);
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
    //
  };

  override focus = (toEdit: boolean) => {
    if (toEdit) {
      if (this.parent.model.readOnly === true) {
        return;
      }
      if (!this.editorView) {
        this.editorReady
          .then(() => {
            this.editorView?.editorReady.then(() => {
              if (this.editorView?.editor?.hasFocus()) {
                return;
              }
              this.editorView?.editor?.focus();
              return;
            });
            return;
          })
          .catch(() => {
            //
          });
      } else {
        if (this.editorView?.editor?.hasFocus()) {
          return;
        }
        this.editorView?.editor?.focus();
        return;
      }
    } else {
      if (this.container?.current?.parentElement?.contains(document.activeElement)) {
        return;
      }
      this.container?.current?.parentElement?.focus();
    }
  };

  getSelections = (): [] => {
    return this.editor?.getSelections() as [];
  };

  getSelectionsOffsetAt = (selection: IRange) => {
    const isSelect = selection;
    const start = this.editor?.getOffsetAt(isSelect.start) ?? 0;
    const end = this.editor?.getOffsetAt(isSelect.end) ?? 0;
    return { start: start, end: end };
  };
}
