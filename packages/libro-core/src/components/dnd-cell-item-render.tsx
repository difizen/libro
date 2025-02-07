/* eslint-disable react-hooks/exhaustive-deps */
import {
  useConfigurationValue,
  CommandRegistry,
  equals,
  ToolbarRender,
  useInject,
  useObserve,
  ViewInstance,
  ViewRender,
} from '@difizen/libro-common/app';
import { l10n } from '@difizen/libro-common/l10n';
import { Tooltip } from 'antd';
import classnames from 'classnames';
import type { FC } from 'react';
import React, { forwardRef, memo, useLayoutEffect, useMemo, useRef } from 'react';

import {
  EditorCellView,
  ExecutableCellModel,
  ExecutableCellView,
  isLibroCellModel,
} from '../cell/index.js';
import { CellCollapsible } from '../collapse-service.js';
import { NotebookCommands } from '../command/index.js';
import '../index.less';
import type { CellView, DndItemProps } from '../libro-protocol.js';
import { isCellView, LibroToolbarArea } from '../libro-protocol.js';
import {
  CellSideToolbarVisible,
  CellTopToolbarSetting,
  CollapserClickActive,
  OutputScrollBtnVisiable,
} from '../libro-setting.js';
import type { LibroView } from '../libro-view.js';
import {
  ArrowDown,
  ArrowRight,
  ContentMore,
  DisableOutputScroll,
  EnableOutputScroll,
} from '../material-from-designer.js';
import { hasErrorOutput } from '../output/index.js';

import {
  CellOutputBottomBlankProvider,
  CellOutputTopProvider,
} from './cell-protocol.js';
import {
  CellExecutionTimeProvider,
  CellInputBottonBlankProvider,
  CellOutputVisulizationProvider,
} from './cell-protocol.js';

const CellInputContent = memo(function CellInputContent(props: { cell: CellView }) {
  const { cell } = props;
  const observableCell = useObserve(cell);
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
      <ViewRender view={observableCell} />
      <CellInputBottonBlank cell={cell} />
    </div>
  );
});

interface CellInputProps {
  cell: CellView;
}
const CellInputInnner = forwardRef(function CellInput(
  props: CellInputProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { cell } = props;
  const observableCell = useObserve(cell);
  const inputCollapserRef = useRef<HTMLDivElement>(null);
  const [collapserClickActive] = useConfigurationValue(CollapserClickActive);
  const handleCellInputCollapser = () => {
    if (collapserClickActive) {
      observableCell.hasInputHidden = !observableCell.hasInputHidden;
    }
  };
  const hasErrorOutputs = EditorCellView.is(observableCell)
    ? hasErrorOutput(observableCell)
    : false;
  // TODO: 性能！
  // const isFirstCell = cell.parent.model.cells.indexOf(cell) === 0 ? true : false;
  const isFirstCell = useMemo(() => {
    return observableCell.parent.model.cells[0] &&
      equals(observableCell.parent.model.cells[0], observableCell)
      ? true
      : false;
  }, [observableCell]);

  return (
    <div className="libro-cell-container" tabIndex={10} ref={ref}>
      <div
        className={`libro-cell-input-collapser ${isFirstCell ? 'firstCell' : ''} ${
          hasErrorOutputs ? 'error' : ''
        } `}
        ref={inputCollapserRef}
        onClick={handleCellInputCollapser}
      />
      <CellInputContent cell={observableCell} />
    </div>
  );
});
const CellInput: FC<CellInputProps> = memo<CellInputProps>(CellInputInnner);

export const CellOutputContent: React.FC<{ cell: CellView }> = memo(
  function CellOutputContent(props: { cell: CellView }) {
    const { cell } = props;

    const observableCell = useObserve(cell);
    const CellOutputVisulization = useInject<CellOutputVisulizationProvider>(
      CellOutputVisulizationProvider,
    );
    const CellOutputBottomBlank = useInject<CellOutputBottomBlankProvider>(
      CellOutputBottomBlankProvider,
    );
    const CellOutputTopBlank = useInject<CellOutputTopProvider>(CellOutputTopProvider);
    const CellExecutionTime = useInject<CellExecutionTimeProvider>(
      CellExecutionTimeProvider,
    );

    if (!ExecutableCellView.is(cell) || !ExecutableCellView.is(observableCell)) {
      return null;
    }

    if (!ExecutableCellModel.is(observableCell.model)) {
      return null;
    }

    const hasOutputsScrolled = observableCell.model.hasOutputsScrolled;

    const isHidden = observableCell.model.hasOutputHidden;
    if (isHidden) {
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
        <CellExecutionTime cell={cell} />
        <CellOutputTopBlank cell={cell} />
        <CellOutputVisulization cell={cell} />
        {observableCell.outputArea.length > 0 && <ViewRender view={cell.outputArea} />}
        <CellOutputBottomBlank cell={cell} />
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

export const LibroCellOutputBottomBlank: CellOutputBottomBlankProvider = forwardRef(
  function LibroCellOutputBottomBlank() {
    return null;
  },
);

export const LibroCellTopBlank: CellOutputTopProvider = forwardRef(
  function LibroCellTopBlank() {
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
  const outputRef = useRef<HTMLDivElement>(null);
  const outputCollapserRef = useRef<HTMLDivElement>(null);
  const [collapserClickActive] = useConfigurationValue(CollapserClickActive);
  const [outputScrollBtnVisiable] = useConfigurationValue(OutputScrollBtnVisiable);
  const command = useInject(CommandRegistry);

  const isExecutingRef = useRef<boolean | null>(null);

  let executing = false;
  if (ExecutableCellModel.is(cell.model)) {
    executing = cell.model.executing;
  }

  useLayoutEffect(() => {
    isExecutingRef.current = !!executing;
  }, [executing]);

  // useLayoutEffect(() => {
  //   if (!outputRef || !isExecutingRef || !outputRef?.current) {
  //     return () => {
  //       //
  //     };
  //   }
  //   const el = outputRef?.current;

  //   const resizeObserver = new ResizeObserver((entries) => {
  //     entries.forEach(() => {
  //       const outputAreaHeight = outputRef?.current?.clientHeight || 0;
  //       if (isExecutingRef.current && outputAreaHeight > 495) {
  //         command.executeCommand(NotebookCommands['EnableOutputScrolling'].id);
  //       }
  //     });
  //   });

  //   resizeObserver.observe(el as HTMLElement);
  //   return () => {
  //     resizeObserver.unobserve(el as HTMLElement);
  //     resizeObserver.disconnect();
  //   };
  // }, [outputRef.current, cell, isExecutingRef]);

  if (!ExecutableCellView.is(cell) || !ExecutableCellModel.is(cell.model)) {
    return null;
  }
  const handleCellOutputCollapser = () => {
    if (ExecutableCellModel.is(cell.model) && collapserClickActive) {
      cell.model.hasOutputHidden = !cell.model.hasOutputHidden;
    }
  };

  const handleOutputScroll = () => {
    if (!ExecutableCellModel.is(cell.model)) {
      return;
    }
    if (cell.model.hasOutputsScrolled) {
      command.executeCommand(NotebookCommands['DisableOutputScrolling'].id);
    } else {
      command.executeCommand(NotebookCommands['EnableOutputScrolling'].id);
    }
  };
  return (
    <div className="libro-cell-output-container" ref={ref}>
      <div ref={outputRef}>
        <div
          className={'libro-cell-output-collapser'}
          ref={outputCollapserRef}
          onClick={handleCellOutputCollapser}
        />
        {outputScrollBtnVisiable && cell.outputArea.length > 0 && (
          <div className="libro-cell-output-scroll">
            <Tooltip
              title={`${
                cell.model.hasOutputsScrolled
                  ? l10n.t('取消固定 Output 高度')
                  : l10n.t('固定 Output 高度')
              }`}
            >
              <div
                className="libro-cell-output-scroll-button "
                onClick={handleOutputScroll}
              >
                {cell.model.hasOutputsScrolled ? (
                  <DisableOutputScroll />
                ) : (
                  <EnableOutputScroll />
                )}
              </div>
            </Tooltip>
          </div>
        )}
        <CellOutputContent cell={cell} />
      </div>
    </div>
  );
});

const HideCellContent: React.FC<{ cell: CellView }> = (props: { cell: CellView }) => {
  const { cell } = props;
  const cellCollapserRef = useRef<HTMLDivElement>(null);
  const [collapserClickActive] = useConfigurationValue(CollapserClickActive);

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

const ExecuteTooltipArea = memo(function ExecuteTooltipArea(props: {
  isMouseOverDragArea: boolean | undefined;
  cell: CellView;
}) {
  const { isMouseOverDragArea, cell } = props;
  const observableCell = useObserve(cell);

  const executable = ExecutableCellModel.is(observableCell.model);
  const executeState =
    ExecutableCellModel.is(observableCell.model) && !observableCell.model.executing
      ? observableCell.model.executeCount || ' '
      : '*';
  return (
    <>
      {executable && !isMouseOverDragArea && (
        <div className="libro-execute-tooltip-area">
          <pre className="libro-execute-state-tip">{`[${executeState}]:`}</pre>
        </div>
      )}
    </>
  );
});

export const DndCellItemContent = memo(function DndCellItemContent(props: {
  cell: CellView;
}) {
  const instance = useInject<LibroView>(ViewInstance);
  const { cell } = props;
  const observableCell = useObserve(cell);
  const isCollapsible = CellCollapsible.is(observableCell);
  const hasCellHidden = useMemo(() => {
    return observableCell.hasCellHidden();
  }, [observableCell]);

  return (
    <>
      {hasCellHidden && <HideCellContent cell={observableCell} />}
      {!hasCellHidden && (
        <>
          {instance.collapserVisible && isCollapsible && (
            <div
              className="libro-markdown-collapser"
              onClick={() => {
                instance.collapseCell(observableCell, !observableCell.headingCollapsed);
              }}
            >
              {observableCell.headingCollapsed ? <ArrowRight /> : <ArrowDown />}
            </div>
          )}
          <CellInput cell={observableCell} />
          <CellOutput cell={observableCell} />
        </>
      )}
    </>
  );
});

export const DndCellItemContainer = memo(function DndCellItemContainer(
  props: DndItemProps,
) {
  const { isDrag, isMouseOverDragArea, cell } = props;

  const [topToolbarVisible] = useConfigurationValue(CellTopToolbarSetting);
  const [sideToolbarVisible] = useConfigurationValue(CellSideToolbarVisible);

  const instance = useInject<LibroView>(ViewInstance);
  const isActive = instance.activeCell?.id === cell.id;
  const topToolbarArgs = useMemo(() => {
    return [cell, instance, LibroToolbarArea.CellTop];
  }, [cell, instance]);

  const rightToolbarArgs = useMemo(() => {
    return [cell, instance, LibroToolbarArea.CellRight];
  }, [cell, instance]);
  if (!isLibroCellModel(cell.model)) {
    return null;
  }

  return (
    <>
      {topToolbarVisible && isActive && (
        <div className="libro-cell-top-toolbar">
          <ToolbarRender data={topToolbarArgs} />
        </div>
      )}
      <ExecuteTooltipArea cell={cell} isMouseOverDragArea={isMouseOverDragArea} />
      <DndCellItemContent cell={cell} />
      {sideToolbarVisible && (
        <div
          className="libro-cell-right-toolbar"
          tabIndex={0}
          onFocus={(e) => {
            e.stopPropagation();
          }}
        >
          {isActive && !isDrag && instance.model.cellsEditable && (
            <ToolbarRender
              data={rightToolbarArgs}
              tooltip={{ placement: LibroToolbarArea.CellRight }}
            />
          )}
        </div>
      )}
    </>
  );
});
const DndCellItemRenderInner = forwardRef(function DndCellItemRender(
  props: DndItemProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { isDrag, isMouseOverDragArea, cell, isDragOver } = props;
  const observableCell = useObserve(cell);
  const instance = useInject<LibroView>(ViewInstance);
  const isActive = instance.activeCell?.id === observableCell.id;
  const hasErrorOutputs = hasErrorOutput(observableCell);
  const hasCellHidden = useMemo(() => {
    return observableCell.hasCellHidden();
  }, [observableCell]);

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
  if (observableCell.wrapperCls) {
    classNames.push(observableCell.wrapperCls);
  }
  return (
    <div className="libro-dnd-cell-border">
      <div className={classnames(classNames)} ref={ref}>
        <DndCellItemContainer
          cell={observableCell}
          isDrag={isDrag}
          isDragOver={isDragOver}
          isMouseOverDragArea={isMouseOverDragArea}
          // ref={ref}
        />
      </div>
    </div>
  );
});
export const DndCellItemRender = memo(DndCellItemRenderInner);
