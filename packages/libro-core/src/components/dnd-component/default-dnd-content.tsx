import { useConfigurationValue } from '@difizen/mana-app';
import { getOrigin, useInject, ViewInstance } from '@difizen/mana-app';
import type { Identifier } from 'dnd-core';
import React, { useEffect, useRef, useState, useCallback, forwardRef } from 'react';
import { useDrag, useDragDropManager, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { CellService } from '../../cell/index.js';
import { CellCollapsible } from '../../collapse-service.js';
import { MultiSelectionWhenShiftClick } from '../../configuration/libro-configuration.js';
import { isCellView, DragAreaKey } from '../../libro-protocol.js';
import type { CellView, DndContentProps } from '../../libro-protocol.js';
import type { LibroView } from '../../libro-view.js';
import { HolderOutlined, PlusOutlined } from '../../material-from-designer.js';
import { hasErrorOutput } from '../../output/index.js';
import { BetweenCellProvider } from '../cell-protocol.js';

export interface Dragparams {
  cell: CellView;
  index: number;
}

export const DefaultDndContent: React.FC<DndContentProps> = ({ cell, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const instance = useInject<LibroView>(ViewInstance);
  const [multiSelectionWhenShiftClick] = useConfigurationValue(
    MultiSelectionWhenShiftClick,
  );
  const BetweenCellContent = useInject<BetweenCellProvider>(BetweenCellProvider);
  const cellService = useInject<CellService>(CellService);
  const dragDropManager = useDragDropManager();
  const dragDropMonitor = dragDropManager.getMonitor();
  const ItemRender = getOrigin(instance.dndItemRender);
  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      const className = (e.target as HTMLDivElement).className;
      if (
        (e.target as HTMLDivElement).tagName === 'svg' ||
        (className &&
          className &&
          typeof className === 'string' &&
          (className.includes('mana-toolbar-item') ||
            className.includes('mana-toolbar')))
      ) {
        return;
      }
      instance.model.selectCell(cell);
      instance.model.selections = [];
      if (cell.shouldEnterEditorMode(e)) {
        instance.enterEditMode();
      }
    },
    [instance, cell],
  );
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.shiftKey && multiSelectionWhenShiftClick) {
        //按shift键时为多选cell
        instance.extendContiguousSelectionTo(index);
        instance.model.mouseMode = 'multipleSelection';
        return;
      }
      instance.model.mouseMode = 'mouseDown';
    },
    [multiSelectionWhenShiftClick, instance, index],
  );
  const handleMouseUp = useCallback(() => {
    if (
      instance.model.mouseMode === 'multipleSelection' ||
      instance.model.mouseMode === 'drag'
    ) {
      return;
    }
    instance.model.selectCell(cell);
    instance.model.selections = [];
  }, [instance, cell]);

  const [{ isDrag }, drag, preview] = useDrag(
    {
      type: DragAreaKey,
      item: { cell, index },
      collect: (monitor) => ({
        isDrag: monitor.isDragging(),
      }),
      end() {
        instance.isDragging = false;
      },
    },
    [cell, index],
  );
  dragDropMonitor.subscribeToStateChange(() => {
    instance.isDragging = dragDropMonitor.isDragging();
  });
  const libroViewContent = instance.container?.current?.getElementsByClassName(
    'libro-view-content',
  )[0] as HTMLElement;
  const scrollTimer = useRef<null | NodeJS.Timeout>(null);
  useEffect(() => {
    scrollTimer.current = setInterval(() => {
      const currentOffset = dragDropMonitor.getClientOffset();
      if (libroViewContent && instance.isDragging && currentOffset) {
        const libroViewClientRect = libroViewContent.getBoundingClientRect();
        const { top, bottom } = libroViewClientRect;
        const { y } = currentOffset;
        const topLimit = top + 30;
        const bottomLimit = bottom - 50;
        if (y < topLimit) {
          libroViewContent.scrollTop -= 0.5;
        } else if (y > bottomLimit) {
          libroViewContent.scrollTop += 0.5;
        }
      }
    }, 10);
    return () => {
      if (scrollTimer.current) {
        clearInterval(scrollTimer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // This gets called after every render, by default
    // (the first one, and every one after that)

    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead.
    preview(getEmptyImage(), {
      // IE fallback: specify that we'd rather screenshot the node
      // when it already knows it's being dragged so we can hide it with CSS.
      captureDraggingState: true,
    });
  }, [preview]);

  const [{ handlerId, isDragOver }, drop] = useDrop<
    Dragparams,
    void,
    {
      handlerId: Identifier | null;
      isDragOver: boolean;
    }
  >({
    accept: DragAreaKey,
    drop(item, monitor) {
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
        .catch(() => {
          //
        });
      if (isCellView(item.cell)) {
        const didDrop = monitor.didDrop();
        if (didDrop) {
          return;
        }
        const dragIndex = instance.findCellIndex(item.cell);
        const dropIndex = instance.findCellIndex(cell);
        if (instance.model.selections.length > 0) {
          const isDragInSelections =
            instance.model.selections.findIndex(
              (selection) => selection.id === item.cell.id,
            ) > -1
              ? true
              : false;
          const isDropInSelections =
            instance.model.selections.findIndex(
              (selection) => selection.id === cell.id,
            ) > -1
              ? true
              : false;
          if (isDragInSelections && isDropInSelections) {
            return;
          }
          if (isDragInSelections) {
            instance.model.exchangeCells(instance.model.selections, dropIndex);
            instance.model.scrollToView(cell);
            return;
          }
        }
        if (dragIndex < dropIndex) {
          instance.model.exchangeCell(dragIndex, dropIndex - 1);
          instance.model.scrollToView(cell);
        }
        if (dragIndex > dropIndex) {
          instance.model.exchangeCell(dragIndex, dropIndex);
          instance.model.scrollToView(cell);
        }
      }
      return;
    },
    collect(monitor) {
      return {
        isDragOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
        handlerId: monitor.getHandlerId(),
      };
    },
  });
  const opacity = isDrag ? 0.4 : 1;
  if (!instance.model.readOnly) {
    drop(ref);
  }
  if (isDrag) {
    instance.model.mouseMode = 'drag';
  }

  const isSelected = instance.isSelected(cell);
  // let isMouseOver = false;
  const [isMouseOverDragArea, setIsMouseOverDragArea] = useState(false);
  const hasCellHidden = cell.hasCellHidden();
  const hasErrorOutputs = hasErrorOutput(cell);
  const isCollapsible = CellCollapsible.is(cell);
  return (
    <div
      className={`libro-dnd-cell-container ${isSelected ? 'selected' : ''} ${
        hasCellHidden ? 'hidden' : ''
      }`}
      data-handler-id={handlerId}
      style={{ opacity }}
      ref={ref}
      id={cell.id}
    >
      <BetweenCellContent index={index} addCell={cell.parent.addCellAbove} />
      {isDragOver && <div className="libro-drag-hoverline" />}
      {isMouseOverDragArea && <HolderOutlined className="libro-handle-style" />}
      <div
        className="libro-drag-area"
        ref={drag}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseOver={() => setIsMouseOverDragArea(true)}
        onMouseLeave={() => setIsMouseOverDragArea(false)}
      />
      <div
        tabIndex={-1}
        onFocus={handleFocus}
        // onClick={e => e.preventDefault()}
        className={`libro-dnd-cell-content ${hasErrorOutputs ? 'error' : ''}`}
      >
        <ItemRender
          isDragOver={!!isDragOver}
          isDrag={!!isDrag}
          cell={cell}
          isMouseOverDragArea={isMouseOverDragArea}
        />
      </div>
      {isCollapsible && cell.headingCollapsed && cell.collapsibleChildNumber > 0 && (
        <div className="libro-cell-collapsed-expander">
          <button
            className="libro-cell-expand-button"
            onClick={() => instance.collapseCell(cell, false)}
          >
            <PlusOutlined className="" /> {cell.collapsibleChildNumber} cell hidden
          </button>
        </div>
      )}
    </div>
  );
};

export const LibroBetweenCellContent: BetweenCellProvider = forwardRef(
  function LibroBetweenCellContent() {
    return null;
  },
);
