/* eslint-disable react-hooks/exhaustive-deps */
import { getOrigin, useInject, ViewInstance } from '@difizen/libro-common/mana-app';
import { useConfigurationValue } from '@difizen/libro-common/mana-app';
import { Button } from 'antd';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useContext,
} from 'react';
import 'resize-observer-polyfill';

import { CellCollapsible } from '../../collapse-service.js';
import type { CellView, DndContentProps } from '../../libro-protocol.js';
import { MultiSelectionWhenShiftClick } from '../../libro-setting.js';
import type { LibroView } from '../../libro-view.js';
import { HolderOutlined, PlusOutlined } from '../../material-from-designer.js';
import { BetweenCellProvider } from '../cell-protocol.js';

import { DragContext } from './dnd-list.js';

export interface Dragparams {
  cell: CellView;
  index: number;
}

export const DndCellContainer: React.FC<DndContentProps> = ({
  cell,
  index,
  position,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const instance = useInject<LibroView>(ViewInstance);
  const [multiSelectionWhenShiftClick] = useConfigurationValue(
    MultiSelectionWhenShiftClick,
  );
  const BetweenCellContent = useInject<BetweenCellProvider>(BetweenCellProvider);
  const [isMouseOverDragArea, setIsMouseOverDragArea] = useState(false);
  const [isDragDown, setIsDragDown] = useState(false);
  const ItemRender = getOrigin(instance.dndItemRender);

  const {
    dragOverIndex,
    isDraging,
    sourceIndex,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    fragFromRef,
  } = useContext(DragContext);

  useLayoutEffect(() => {
    if (typeof ref !== 'object') {
      return () => {
        //
      };
    }
    const el = ref?.current;
    if (!el) {
      return () => {
        //
      };
    }

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const isVisible =
          entry.contentRect.width !== 0 && entry.contentRect.height !== 0;

        if (isVisible) {
          cell.noEditorAreaHeight = ref.current?.clientHeight || 0;
        }
      });
    });

    resizeObserver.observe(el as HTMLElement);
    return () => {
      cell.noEditorAreaHeight = 0;
      resizeObserver.disconnect();
    };
  }, [ref, cell]);

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
    if (instance.model.selections.length !== 0) {
      instance.model.selections = [];
    }
  }, [instance, cell]);

  const isMultiSelected =
    instance.model.selections.length !== 0 && instance.isSelected(cell);

  const isDragOver = useMemo(() => {
    return index === dragOverIndex;
  }, [index, dragOverIndex]);

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!instance.model.cellsEditable) {
        e.preventDefault();
        return;
      }
      onDragStart?.(e, index);
    },
    [index, instance.model.cellsEditable, onDragStart],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      //判断拖拽来源是否cell
      if (fragFromRef.current !== 'cell') {
        return;
      }
      e.preventDefault();
      instance.model.mouseMode = 'drag';
      //判断是向下拖拽还是向上拖拽
      if (sourceIndex! < index) {
        setIsDragDown(true);
      } else {
        setIsDragDown(false);
      }
      onDragOver(e, index);
    },
    [fragFromRef, index, instance.model, onDragOver, sourceIndex],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (fragFromRef.current !== 'cell') {
        return;
      }
      onDrop(e, index);
    },
    [fragFromRef, index, onDrop],
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent) => {
      if (fragFromRef.current !== 'cell') {
        return;
      }
      onDragEnd(e, index);
    },
    [fragFromRef, index, onDragEnd],
  );

  const opacity = useMemo(() => {
    return {
      opacity: isDraging && sourceIndex === index ? 0.4 : 1,
    };
  }, [index, isDraging, sourceIndex]);

  const onMouseOver = useCallback(() => {
    setIsMouseOverDragArea(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsMouseOverDragArea(false);
  }, []);

  // let isMouseOver = false;
  const hasCellHidden = useMemo(() => {
    return cell.hasCellHidden();
  }, [cell]);
  const isCollapsible = CellCollapsible.is(cell);

  const wrapperclassName = useMemo(() => {
    return `libro-dnd-cell-container ${isMultiSelected ? 'multi-selected' : ''} ${
      hasCellHidden ? 'hidden' : ''
    }`;
  }, [isMultiSelected]);

  return (
    <div
      className={wrapperclassName}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      style={opacity}
      ref={ref}
      id={cell.id}
    >
      <BetweenCellContent
        index={position || index}
        addCell={cell.parent.addCellAbove}
      />
      {!isDragDown && isDragOver && <div className="libro-drag-hoverline" />}
      {isMouseOverDragArea && <HolderOutlined className="libro-handle-style" />}
      <div
        className="libro-drag-area"
        onDragStart={handleDragStart}
        draggable={instance.model.cellsEditable}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
      />
      <div
        tabIndex={-1}
        onFocus={handleFocus}
        // onClick={e => e.preventDefault()}
        className="libro-dnd-cell-content"
      >
        <ItemRender
          isDragOver={!!isDragOver}
          isDrag={!!isDraging}
          cell={cell}
          isMouseOverDragArea={isMouseOverDragArea}
        />
      </div>
      {isCollapsible && cell.headingCollapsed && cell.collapsibleChildNumber > 0 && (
        <div className="libro-cell-collapsed-expander">
          <Button
            className="libro-cell-expand-button"
            onClick={() => instance.collapseCell(cell, false)}
            icon={<PlusOutlined className="" />}
            type="default"
          >
            {cell.collapsibleChildNumber} cell hidden
          </Button>
        </div>
      )}
      {isDragDown && isDragOver && <div className="libro-drag-hoverline-last-one" />}
    </div>
  );
};

export const LibroBetweenCellContent: BetweenCellProvider = forwardRef(
  function LibroBetweenCellContent() {
    return null;
  },
);
