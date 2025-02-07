import type { CodeEditorViewOptions } from '@difizen/libro-jupyter';
import { CellUri, LibroEditorCellView } from '@difizen/libro-jupyter';
import type { ViewComponent } from '@difizen/mana-app';
import { useInject, ViewRender } from '@difizen/mana-app';
import { view, ViewInstance } from '@difizen/mana-app';
import React from 'react';

const CellEditor: React.FC = () => {
  const instance = useInject<LibroEditorDemoCellView>(ViewInstance);
  return <>{instance.editorView && <ViewRender view={instance.editorView} />}</>;
};

const CellEditorMemo = React.memo(CellEditor);

const EditorDemoCellComponent = React.forwardRef<HTMLDivElement>(
  function CodeEditorViewComponent(props, ref) {
    const instance = useInject<LibroEditorDemoCellView>(ViewInstance);
    return (
      <div className={instance.className} ref={ref}>
        <CellEditorMemo />
      </div>
    );
  },
);

@view('libro-editor-demo-cell-view')
export class LibroEditorDemoCellView extends LibroEditorCellView {
  view: ViewComponent = EditorDemoCellComponent;

  protected override getEditorOption(): CodeEditorViewOptions {
    const option: CodeEditorViewOptions = {
      uuid: CellUri.from(this.parent.model.id, this.model.id).toString(),
      editorHostId: this.parent.id + this.id,
      model: this.model,
      config: {
        readOnly: !this.parent.model.inputEditable,
        editable: this.parent.model.inputEditable,
        lineWrap: 'on',
        matchBrackets: false,
        autoClosingBrackets: false,
        placeholder: '我是一个编辑器 demo cell，请输入代码',
      },
    };
    return option;
  }
}
