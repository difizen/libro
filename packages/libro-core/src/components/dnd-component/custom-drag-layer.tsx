/* eslint-disable react-hooks/exhaustive-deps */
import { useInject, ViewInstance } from '@difizen/mana-app';
import { ViewRender } from '@difizen/mana-app';
import type { FC, CSSProperties } from 'react';
import { useState, useEffect, memo } from 'react';
import type { XYCoord } from 'react-dnd';
import { useDragLayer } from 'react-dnd';

import type { CellService } from '../../cell/index.js';
import { LibroCellService } from '../../cell/index.js';
import type { CellView } from '../../libro-protocol.js';
import type { LibroView } from '../../libro-view.js';

export interface SelectionPreviewProps {
  activeCell: CellView;
}
const layerStyles: CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 1000,
  left: 0,
  top: 0,
  width: '300px',
  height: '50px',
};

const getItemStyles = (currentOffset: XYCoord | null) => {
  if (!currentOffset) {
    return {
      display: 'none',
    };
  }

  const { x, y } = currentOffset;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
};

const MultipleSelectionPreview: FC<{ activeCell: CellView }> = ({ activeCell }) => {
  const cellService = useInject<CellService>(LibroCellService);
  const [multipleSelectionPreview, setMultipleSelectionPreview] = useState<CellView>();
  useEffect(() => {
    cellService
      .getOrCreateView(activeCell.model.options, activeCell.parent.id)
      .then((view) => {
        setMultipleSelectionPreview(view);
        return;
      })
      .catch((e) => {
        //
      });
  }, []);

  return (
    <div className="libro-dnd-multiple-selection-preview">
      <div className="libro-dnd-active-selection">
        {multipleSelectionPreview && <ViewRender view={multipleSelectionPreview} />}
      </div>
      <div className="libro-dnd-cascading-multiple-selection" />
    </div>
  );
};

export const MultipleSelectionPreviewMemo: FC<SelectionPreviewProps> = memo(
  MultipleSelectionPreview,
);

const SingleSelectionDragPreview: FC<{ activeCell: CellView }> = ({ activeCell }) => {
  const cellService = useInject<CellService>(LibroCellService);
  const [singleSelectionPreview, setSingleSelectionPreview] = useState<CellView>();
  useEffect(() => {
    cellService
      .getOrCreateView(
        {
          ...activeCell.model.options,
          modelId: activeCell.model.id,
          singleSelectionDragPreview: true,
        },
        activeCell.parent.id,
      )
      .then((view) => {
        setSingleSelectionPreview(view);
        return;
      })
      .catch((e) => {
        //
      });
  }, []);

  return (
    <div className="libro-dnd-active-selection">
      {singleSelectionPreview && <ViewRender view={singleSelectionPreview} />}
    </div>
  );
};

export const SingleSelectionPreviewMemo: FC<SelectionPreviewProps> = memo(
  SingleSelectionDragPreview,
);

export const CustomDragLayer = () => {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  const instance = useInject<LibroView>(ViewInstance);

  function renderItem() {
    const isItemSelected =
      instance.model.selections.findIndex((select) => select.id === item.cell.id) >= 0;
    if (instance.model.selections.length !== 0 && isItemSelected) {
      return (
        <>
          {instance.model.active && (
            <MultipleSelectionPreviewMemo activeCell={instance.model.active} />
          )}
        </>
      );
    }
    return (
      <>
        {instance.model.active && (
          <SingleSelectionPreviewMemo activeCell={instance.model.active} />
        )}
      </>
    );
  }

  if (!isDragging) {
    return null;
  }
  return (
    <div className="libro-custom-drag-layer" style={layerStyles}>
      <div style={getItemStyles(currentOffset)}>{renderItem()}</div>
    </div>
  );
};
