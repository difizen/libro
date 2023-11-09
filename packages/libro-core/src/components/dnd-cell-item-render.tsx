import { useConfigurationValue } from '@difizen/mana-app';
import {
  ToolbarRender,
  useInject,
  useObserve,
  ViewInstance,
  ViewRender,
} from '@difizen/mana-app';
import classnames from 'classnames';
import React, { useMemo, useRef, memo, forwardRef } from 'react';

import '../index.less';
import {
  EditorCellView,
  ExecutableCellModel,
  ExecutableCellView,
  isLibroCellModel,
} from '../cell/index.js';
import { CellCollapsible } from '../collapse-service.js';
import {
  CellSideToolbarVisible,
  CellTopToolbarSetting,
  CollapserActive,
} from '../configuration/libro-configuration.js';
import type { CellView, DndItemProps } from '../libro-protocol.js';
import { LibroToolbarArea, isCellView } from '../libro-protocol.js';
import type { LibroView } from '../libro-view.js';
import { ArrowDown, ArrowRight, ContentMore } from '../material-from-designer.js';
import { hasErrorOutput } from '../output/index.js';

import {
  CellInputBottonBlankProvider,
  CellExecutionTimeProvider,
  CellOutputVisulizationProvider,
} from './cell-protocol.js';

const CellInputContent = memo(function CellInputContent(props: { cell: CellView }) {
  const { cell } = props;
  const observableCell = useObserve(cell);
  const CellExecutionTime = useInject<CellExecutionTimeProvider>(
    CellExecutionTimeProvider,
  );
  const CellInputBottonBlank = useInject<CellInputBottonBlankProvider>(
    CellInputBottonBlankProvider,
  );

  if (!observableCell?.view || !isCellView(observableCell)) {
    return null;
  }
  const isHidden = observableCell.hasInputHidden;
  if (isHidden) {
    return (
      <div className="libro-input-hidden">
        <ContentMore />
      </div>
    );
  }
  return (
    <div className="libro-cell-input-content">
      <CellExecutionTime cell={cell} />
      <ViewRender view={observableCell} />
      <CellInputBottonBlank cell={cell} />
    </div>
  );
});
const CellInput: React.FC<{ cell: CellView }> = forwardRef(function CellInput(
  props: {
    cell: CellView;
  },
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { cell } = props;
  const inputCollapserRef = useRef<HTMLDivElement>(null);
  const [collapserClickActive] = useConfigurationValue(CollapserActive);
  const handleCellInputCollapser = () => {
    if (collapserClickActive) {
      cell.hasInputHidden = !cell.hasInputHidden;
    }
  };
  const hasErrorOutputs = EditorCellView.is(cell) ? hasErrorOutput(cell) : false;
  const isFirstCell = cell.parent.model.cells.indexOf(cell) === 0 ? true : false;
  return (
    <div className="libro-cell-container" tabIndex={10} ref={ref}>
      <div
        className={`libro-cell-input-collapser ${isFirstCell ? 'firtCell' : ''} ${
          hasErrorOutputs ? 'error' : ''
        } `}
        ref={inputCollapserRef}
        onClick={handleCellInputCollapser}
      />
      <CellInputContent cell={cell} />
    </div>
  );
});

export const CellOutputContent: React.FC<{ cell: CellView }> = memo(
  function CellOutputContent(props: { cell: CellView }) {
    const { cell } = props;
    const observableCell = useObserve(cell);
    const CellOutputVisulization = useInject<CellOutputVisulizationProvider>(
      CellOutputVisulizationProvider,
    );

    if (!ExecutableCellView.is(cell) || !ExecutableCellView.is(observableCell)) {
      return null;
    }

    if (!ExecutableCellModel.is(observableCell.model)) {
      return null;
    }

    const hasOutputsScrolled = observableCell.model.hasOutputsScrolled;

    const isHidden = observableCell.model.hasOutputHidden;
    if (isHidden && observableCell?.outputArea?.length) {
      return (
        <div className="libro-cell-output-hidden">
          <ContentMore />
        </div>
      );
    }
    return (
      <div
        className={`libro-cell-output-content ${hasOutputsScrolled ? 'scrolled' : ''} `}
      >
        <CellOutputVisulization cell={cell} />
        <ViewRender view={cell.outputArea} />
      </div>
    );
  },
);

export const LibroCellExecutionTime: CellExecutionTimeProvider = forwardRef(
  function LibroCellExecutionTime() {
    return null;
  },
);

export const LibroCellInputBottonBlank: CellInputBottonBlankProvider = forwardRef(
  function LibroCellInputBottonBlank() {
    return null;
  },
);

export const LibroCellVisualization: CellOutputVisulizationProvider = forwardRef(
  function LibroCellVisualization() {
    return null;
  },
);

const CellOutput: React.FC<{ cell: CellView }> = forwardRef(function CellOutput(
  props: {
    cell: CellView;
  },
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { cell } = props;
  const outputCollapserRef = useRef<HTMLDivElement>(null);
  const [collapserActive] = useConfigurationValue(CollapserActive);
  if (!ExecutableCellView.is(cell)) {
    return null;
  }
  if (
    !isCellView(cell) ||
    !ExecutableCellModel.is(cell.model) ||
    !cell.outputArea?.length
  ) {
    return null;
  }
  const handleCellOutputCollapser = () => {
    if (ExecutableCellModel.is(cell.model) && collapserActive) {
      cell.model.hasOutputHidden = !cell.model.hasOutputHidden;
    }
  };
  const hasErrorOutputs = hasErrorOutput(cell);
  return (
    <div className="libro-cell-output-container" ref={ref}>
      <div
        className={`libro-cell-output-collapser ${hasErrorOutputs ? 'error' : ''} `}
        ref={outputCollapserRef}
        onClick={handleCellOutputCollapser}
      />
      <CellOutputContent cell={cell} />
    </div>
  );
});

const HideCellContent: React.FC<{ cell: CellView }> = (props: { cell: CellView }) => {
  const { cell } = props;
  const cellCollapserRef = useRef<HTMLDivElement>(null);
  const [collapserClickActive] = useConfigurationValue(CollapserActive);

  const handleCellCollapser = () => {
    if (collapserClickActive) {
      cell.hasInputHidden = !cell.hasInputHidden;
    }
  };
  const hasErrorOutputs = hasErrorOutput(cell);
  return (
    <>
      <div
        className={`libro-cell-collapser ${hasErrorOutputs ? 'error' : ''}`}
        ref={cellCollapserRef}
        onClick={handleCellCollapser}
      />
      <div className="libro-cell-hidden">
        <ContentMore />
      </div>
    </>
  );
};
export const DndCellItemRender = forwardRef(function DndCellItemRender(
  props: DndItemProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { isDrag, isMouseOverDragArea, cell } = props;
  const [topToolbarVisible] = useConfigurationValue(CellTopToolbarSetting);
  const [sideToolbarVisible] = useConfigurationValue(CellSideToolbarVisible);

  const instance = useInject<LibroView>(ViewInstance);
  const isActive = instance.activeCell?.id === cell.id;
  const executable = ExecutableCellModel.is(cell.model);
  const isCollapsible = CellCollapsible.is(cell);
  const executeState =
    ExecutableCellModel.is(cell.model) && !cell.model.executing
      ? cell.model.executeCount || ' '
      : '*';
  // const hasExecuteCount =
  //   ExecutableCellModel.is(cell.model) &&
  //   typeof cell.model.executeCount === 'number' &&
  //   cell.model.executeCount > 0;
  const topToolbarArgs = useMemo(() => {
    return [cell, instance, LibroToolbarArea.CellTop];
  }, [cell, instance]);

  const rightToolbarArgs = useMemo(() => {
    return [cell, instance, LibroToolbarArea.CellRight];
  }, [cell, instance]);

  if (!isLibroCellModel(cell.model)) {
    return null;
  }
  const hasCellHidden = cell.hasCellHidden();
  const hasErrorOutputs = hasErrorOutput(cell);

  const classNames = [
    'libro-dnd-cell',
    { active: isActive },
    { 'command-mode': instance.model.commandMode },
    { 'edit-mode': !instance.model.commandMode },
    { error: hasErrorOutputs },
    {
      hidden: hasCellHidden,
    },
  ];
  if (cell.wrapperCls) {
    classNames.push(cell.wrapperCls);
  }

  return (
    <div
      className={`libro-dnd-cell-border ${isActive ? 'active' : ''} ${
        instance.model.commandMode ? 'command-mode' : ''
      } ${hasErrorOutputs ? 'error' : ''}`}
    >
      <div className={classnames(classNames)}>
        {topToolbarVisible && isActive && (
          <div className="libro-cell-top-toolbar">
            <ToolbarRender data={topToolbarArgs} />
          </div>
        )}
        {executable && !isMouseOverDragArea && (
          <div className="libro-execute-tooltip-area">
            <pre className="libro-execute-state-tip">{`[${executeState}]:`}</pre>
          </div>
        )}
        <div className="libro-dnd-cell-preview" ref={ref} />
        {cell.hasCellHidden() && <HideCellContent cell={cell} />}
        {!cell.hasCellHidden() && (
          <>
            {instance.collapserVisible && isCollapsible && (
              <div
                className="libro-markdown-collapser"
                onClick={() => {
                  instance.collapseCell(cell, !cell.headingCollapsed);
                }}
              >
                {cell.headingCollapsed ? <ArrowRight /> : <ArrowDown />}
              </div>
            )}
            <CellInput cell={cell} />
            <CellOutput cell={cell} />
          </>
        )}
        {sideToolbarVisible && (
          <div className="libro-cell-right-toolbar">
            {isActive && !isDrag && instance.model.readOnly !== true && (
              <ToolbarRender
                data={rightToolbarArgs}
                tooltip={{ placement: LibroToolbarArea.CellRight }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
});
