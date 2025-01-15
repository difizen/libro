/* eslint-disable react-hooks/exhaustive-deps */
import {
  CellService,
  CellView,
  DndContentProps,
  LibroCellService,
} from '@difizen/libro-jupyter';
import { getOrigin, useInject, ViewInstance } from '@difizen/mana-app';
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import 'resize-observer-polyfill';
import type { LibroAppView } from './libro-app-view.js';

export interface Dragparams {
  cell: CellView;
  index: number;
}

export const AppCellContainer: React.FC<DndContentProps> = ({ cell, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const appInstance = useInject<LibroAppView>(ViewInstance);
  const instance = appInstance.libroView;

  const cellService = useInject<CellService>(LibroCellService);

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
      if (!instance) return;
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
      if (!instance) return;
      instance.model.mouseMode = 'mouseDown';
    },
    [instance, index],
  );
  const handleMouseUp = useCallback(() => {
    if (!instance) return;
    if (
      instance.model.mouseMode === 'multipleSelection' ||
      instance.model.mouseMode === 'drag'
    ) {
      return;
    }
    instance.model.selectCell(cell);
    instance.model.selections = [];
  }, [instance, cell]);

  const opacity = 1;
  if (!instance) return null;
  const ItemRender = getOrigin(appInstance.dndItemRender);
  const isMultiSelected =
    instance.model.selections.length !== 0 && instance.isSelected(cell);
  // let isMouseOver = false;
  const [isMouseOverDragArea, setIsMouseOverDragArea] = useState(false);
  const hasCellHidden = useMemo(() => {
    return cell.hasCellHidden();
  }, [cell]);

  return (
    <div
      className={`libro-dnd-cell-container ${isMultiSelected ? 'multi-selected' : ''} ${
        hasCellHidden ? 'hidden' : ''
      }`}
      style={{ opacity }}
      ref={ref}
      id={cell.id}
    >
      <div
        className="libro-drag-area"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseOver={() => setIsMouseOverDragArea(true)}
        onMouseLeave={() => setIsMouseOverDragArea(false)}
      />
      <div
        tabIndex={-1}
        onFocus={handleFocus}
        // onClick={e => e.preventDefault()}
        className="libro-dnd-cell-content"
      >
        <ItemRender
          isDragOver={false}
          isDrag={false}
          cell={cell}
          isMouseOverDragArea={isMouseOverDragArea}
        />
      </div>
    </div>
  );
};
