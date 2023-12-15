import { getOrigin, useInject, useObserve, ViewInstance } from '@difizen/mana-app';
import classNames from 'classnames';
import type { FC, ReactNode } from 'react';
import { forwardRef, memo, useEffect, useState } from 'react';
import type { XYCoord } from 'react-dnd';
import { useDrop } from 'react-dnd';

import type { CellService } from '../../cell/index.js';
import { LibroCellService } from '../../cell/index.js';
import type { CellView, DndContentProps } from '../../libro-protocol.js';
import { DragAreaKey, isCellView } from '../../libro-protocol.js';
import type { LibroView } from '../../libro-view.js';
import { VirtualizedManagerHelper } from '../../virtualized-manager-helper.js';
import { LibroCellsOutputRender } from '../libro-virtualized-render.js';

import type { Dragparams } from './default-dnd-content.js';
import './index.less';

export const DndCellRender: FC<DndContentProps> = memo(function DndCellRender({
  cell,
  index,
  ...props
}: DndContentProps) {
  const observableCell = useObserve(cell);
  const instance = useInject<LibroView>(ViewInstance);
  const DndCellContainer = instance.dndContentRender;

  return (
    <DndCellContainer cell={observableCell} key={cell.id} index={index} {...props} />
  );
});

// 定义一个函数用于渲染非虚拟列表时的单元格
const renderNonVirtualListCells = (cells: CellView[]) => (
  <div style={{ height: '100%', overflow: 'visible' }}>
    {cells
      .filter((cell) => !cell.collapsedHidden)
      .map((cell, index) => (
        <DndCellRender cell={cell} key={cell.id} index={index} />
      ))}
  </div>
);

export const DndCellsRender = forwardRef<
  HTMLDivElement,
  { libroView: LibroView; addCellButtons: ReactNode }
>(function DndCellsRender(
  { libroView, addCellButtons }: { libroView: LibroView; addCellButtons: ReactNode },
  ref,
) {
  const LoadingRender = getOrigin(libroView.loadingRender);
  const virtualizedManagerHelper = useInject(VirtualizedManagerHelper);
  const virtualizedManager = virtualizedManagerHelper.getOrCreate(libroView.model);

  const cells = libroView.model.getCells().reduce<CellView[]>(function (a, b) {
    if (a.indexOf(b) < 0) {
      a.push(b);
    }
    return a;
  }, []);

  const [isVirtualList, setIsVirtualList] = useState<boolean>(false);
  const [isJudging, setIsJudging] = useState<boolean>(true);

  useEffect(() => {
    if (!libroView.model.isInitialized) {
      return;
    }

    let size = undefined;
    let path = undefined;

    // TODO: 类型处理
    const model = libroView.model as any;
    if (model.currentFileContents && model.currentFileContents.size) {
      size = parseFloat((model.currentFileContents.size / 1048576).toFixed(3)); // 单位MB
      path = model.currentFileContents.path || '';
    }

    setIsJudging(true);
    virtualizedManager
      .openVirtualized(cells.length, size, path)
      .then((willOpen) => {
        setIsVirtualList(willOpen);
        return;
      })
      .catch(() => {
        setIsVirtualList(false);
      })
      .finally(() => {
        setIsJudging(false);
      })
      .catch((e) => {
        //
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [virtualizedManager, libroView.model.isInitialized]);

  const isInitialized = libroView.model.isInitialized;
  const isLoading = !isInitialized || isJudging;
  const shouldRenderCells = isInitialized && !isJudging;

  return (
    <>
      <div
        className={classNames(
          'libro-dnd-cells-container',
          isVirtualList && 'virtual_list_container',
        )}
        ref={ref}
      >
        {isLoading && <LoadingRender />}
        <>
          {shouldRenderCells && (
            <>
              {isVirtualList ? (
                <LibroCellsOutputRender
                  cells={cells}
                  libroView={libroView}
                  addCellButtons={addCellButtons}
                />
              ) : (
                renderNonVirtualListCells(cells)
              )}
            </>
          )}
        </>
      </div>
      {shouldRenderCells && !isVirtualList && addCellButtons}
    </>
  );
});

export const DndList = forwardRef<
  HTMLDivElement,
  { libroView: LibroView; children: ReactNode }
>(function DndList(
  {
    libroView,
    children,
  }: {
    libroView: LibroView;
    children: ReactNode;
  },
  ref,
) {
  const cellService = useInject<CellService>(LibroCellService);

  const [, drop] = useDrop<Dragparams>(() => ({
    accept: DragAreaKey,
    drop(item, dropMonitor) {
      cellService
        .getOrCreateView(
          {
            ...item.cell.model.options,
            modelId: item.cell.model.id,
            singleSelectionDragPreview: true,
          },
          item.cell.parent.id,
        )
        .then((view) => {
          view.dispose();
          return;
        })
        .catch((e) => {
          //
        });
      if (isCellView(item.cell)) {
        const didDrop = dropMonitor.didDrop();
        if (didDrop) {
          return;
        }
        // Determine mouse position
        const clientOffset = dropMonitor.getClientOffset();
        const clientOffsetY = (clientOffset as XYCoord).y;
        const dragIndex = libroView.findCellIndex(item.cell);
        // Determine rectangle on screen
        const lastCell =
          libroView.model.getCells()[libroView.model.getCells().length - 1];
        const lastCellOffsetY = lastCell.container?.current?.getBoundingClientRect().y;
        if (lastCellOffsetY && clientOffsetY >= lastCellOffsetY) {
          if (libroView.model.selections.length > 0) {
            const isDragInSelections =
              libroView.model.selections.findIndex(
                (selection) => selection.id === item.cell.id,
              ) > -1
                ? true
                : false;
            if (isDragInSelections) {
              libroView.model.exchangeCells(
                libroView.model.selections,
                libroView.model.cells.length,
              );
              return;
            }
          }
          libroView.model.exchangeCell(dragIndex, libroView.model.cells.length - 1);
        }
      }
      // Determine mouse position

      return;
    },
  }));

  return (
    <div className="libro-dnd-list-container" ref={drop}>
      <DndCellsRender libroView={libroView} addCellButtons={children} />
    </div>
  );
});
