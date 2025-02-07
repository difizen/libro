/* eslint-disable @typescript-eslint/no-parameter-properties */
/* eslint-disable @typescript-eslint/parameter-properties */
import type { CodeEditorViewOptions } from '@difizen/libro-code-editor';
import { CellUri } from '@difizen/libro-common';
import type { CellViewOptions } from '@difizen/libro-core';
import { CellService, LibroEditorCellView } from '@difizen/libro-core';
import { getOrigin, useInject } from '@difizen/libro-common/app';
import {
  view,
  ViewInstance,
  ViewManager,
  ViewOption,
  ViewRender,
} from '@difizen/libro-common/app';
import { inject, transient } from '@difizen/libro-common/app';
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
  declare model: LibroRawCellModel;
  override view = CodeEditorViewComponent;

  viewManager: ViewManager;

  constructor(
    @inject(ViewOption) options: CellViewOptions,
    @inject(CellService) cellService: CellService,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    super(options, cellService);
    this.viewManager = viewManager;
    this.className = this.className + ' raw';
  }

  protected override getEditorOption(): CodeEditorViewOptions {
    const option: CodeEditorViewOptions = {
      uuid: CellUri.from(this.parent.model.id, this.model.id).toString(),
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
}
