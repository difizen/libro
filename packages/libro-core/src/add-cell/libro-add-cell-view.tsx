import { DisplayWrapComponent } from '@difizen/libro-common';
import { prop, useInject } from '@difizen/mana-app';
import { BaseView, CommandRegistry, view, ViewInstance } from '@difizen/mana-app';
import { inject, transient } from '@difizen/mana-app';
import { Button } from 'antd';
import React from 'react';
import './index.less';

import { CellService } from '../cell/index.js';
import type { CellMeta } from '../cell/index.js';
import { NotebookCommands } from '../command/index.js';
import type { LibroView } from '../libro-view.js';
import { PlusOutlined } from '../material-from-designer.js';

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
      {instance
        .getCellList()
        .sort((a, b) => {
          if (a.order < b.order) {
            return -1;
          } else {
            return 1;
          }
        })
        .map((item: AddType) => {
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

export const LibroWrappedAddCell = React.forwardRef(function LibroWrappedAddCell() {
  const instance = useInject<LibroAddCellView>(ViewInstance);
  return (
    <DisplayWrapComponent mode={instance.parent?.model.readOnly}>
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
