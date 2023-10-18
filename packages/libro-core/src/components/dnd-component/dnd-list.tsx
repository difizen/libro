import { getOrigin, useInject, useObserve, ViewInstance } from '@difizen/mana-app';
import type { FC } from 'react';
import { forwardRef, memo } from 'react';
import type { XYCoord } from 'react-dnd';
import { useDrop } from 'react-dnd';

import { LibroCellService } from '../../cell/index.js';
import type { CellService } from '../../cell/index.js';
import { DragAreaKey, isCellView } from '../../libro-protocol.js';
import type { CellView, DndContentProps } from '../../libro-protocol.js';
import type { LibroView } from '../../libro-view.js';

import type { Dragparams } from './default-dnd-content.js';

const DndContent: FC<DndContentProps> = ({ cell, index, ...props }) => {
  const observableCell = useObserve(cell);
  const instance = useInject<LibroView>(ViewInstance);
  const DndContentRender = instance.dndContentRender;
  return (
    <DndContentRender cell={observableCell} key={cell.id} index={index} {...props} />
  );
};
const DndContentMemo = memo(DndContent);

export const DndCellContent = forwardRef<HTMLDivElement, { libroView: LibroView }>(
  function DndCellContent({ libroView }, ref) {
    const LoadingRender = getOrigin(libroView.loadingRender);
    const cells = libroView.model.getCells().reduce<CellView[]>(function (a, b) {
      if (a.indexOf(b) < 0) {
        a.push(b);
      }
      return a;
    }, []);
    return (
      <div className="libro-dnd-cells-container" ref={ref}>
        {!libroView.model.isInitialized && <LoadingRender />}
        {libroView.model.isInitialized &&
          cells
            .filter((cell) => cell.collapsedHidden === false)
            .map((cell, index) => {
              return <DndContentMemo cell={cell} key={cell.id} index={index} />;
            })}
      </div>
    );
  },
);

export function DndList({
  libroView,
  children,
}: {
  libroView: LibroView;
  children: any;
}) {
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
          return view.dispose();
        })
        .catch(() => {
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
      <DndCellContent libroView={libroView} />
      {children}
    </div>
  );
}
