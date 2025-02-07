import { DisplayWrapComponent } from '@difizen/libro-common';
import {
  inject,
  transient,
  prop,
  useInject,
  BaseView,
  CommandRegistry,
  view,
  ViewInstance,
} from '@difizen/libro-common/mana-app';
import { Button } from 'antd';
import { forwardRef } from 'react';

import { CellService } from '../cell/index.js';
import type { CellMeta } from '../cell/index.js';
import { NotebookCommands } from '../command/index.js';
import type { LibroView } from '../libro-view.js';
import { PlusOutlined } from '../material-from-designer.js';
import './index.less';

type AddType = {
  name: string;
  type: string;
};

export const LibroAddCell: React.FC = () => {
  const instance = useInject<LibroAddCellView>(ViewInstance);
  const command = useInject(CommandRegistry);
  const addCell = async (type: string) => {
    command.executeCommand(
      NotebookCommands['InsertCellBottom'].id,
      instance.parent,
      type,
    );
  };
  return (
    <div className="libro-add-cell-container default-add-cell-container">
      {instance.getCellList().map((item: AddType) => {
        return (
          <Button
            className="libro-add-cell-container-item "
            key={item.name}
            onClick={() => {
              addCell(item.type);
            }}
            icon={<PlusOutlined className="libro-add-cell-icon" />}
          >
            {item.name}
          </Button>
        );
      })}
    </div>
  );
};

export const LibroWrappedAddCell = forwardRef(function LibroWrappedAddCell() {
  const instance = useInject<LibroAddCellView>(ViewInstance);
  return (
    <DisplayWrapComponent mode={!instance.parent?.model.cellsEditable}>
      <LibroAddCell />
    </DisplayWrapComponent>
  );
});

@transient()
@view('libro-add-cell-view')
export class LibroAddCellView extends BaseView {
  parent: LibroView | undefined = undefined;
  override view = LibroWrappedAddCell;

  @prop()
  addList: CellMeta[] = [];

  cellService: CellService;

  constructor(@inject(CellService) cellService: CellService) {
    super();
    this.cellService = cellService;
  }

  override onViewMount() {
    this.addList = this.cellService.cellsMeta;
  }

  override onViewUnmount() {
    //
  }

  override onViewResize() {
    //
  }

  defaultFilter = (cellmeta: CellMeta) => cellmeta.type !== 'raw';

  getCellList(filter = this.defaultFilter) {
    return this.addList.filter(filter);
  }
}
