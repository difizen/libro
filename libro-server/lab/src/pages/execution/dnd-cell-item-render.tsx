/* eslint-disable react-hooks/exhaustive-deps */
import {
  useConfigurationValue,
  equals,
  useInject,
  useObserve,
  ViewInstance,
  ViewRender,
} from '@difizen/mana-app';
import classnames from 'classnames';
import type { FC } from 'react';
import React, { forwardRef, memo, useLayoutEffect, useMemo, useRef } from 'react';
import {
  CellExecutionTimeProvider,
  CellInputBottonBlankProvider,
  CellOutputVisulizationProvider,
  CellView,
  CollapserClickActive,
  ContentMore,
  DndItemProps,
  ExecutableCellModel,
  ExecutableCellView,
  hasErrorOutput,
  isCellView,
} from '@difizen/libro-jupyter';
import { LibroAppView } from './libro-app-view.js';

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

interface CellInputProps {
  cell: CellView;
}
const CellInputInnner = forwardRef(function CellInput(
  props: CellInputProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { cell } = props;
  const observableCell = useObserve(cell);
  const [collapserClickActive] = useConfigurationValue(CollapserClickActive);
  const handleCellInputCollapser = () => {
    if (collapserClickActive) {
      observableCell.hasInputHidden = !observableCell.hasInputHidden;
    }
  };
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
  const outputRef = useRef<HTMLDivElement>(null);

  const isExecutingRef = useRef<boolean | null>(null);

  let executing = false;
  if (ExecutableCellModel.is(cell.model)) {
    executing = cell.model.executing;
  }

  useLayoutEffect(() => {
    isExecutingRef.current = !!executing;
  }, [executing]);

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

  return (
    <div className="libro-cell-output-container" ref={ref}>
      <div ref={outputRef}>
        <CellOutputContent cell={cell} />
      </div>
    </div>
  );
});

export const DndCellItemContent = memo(function DndCellItemContent(props: {
  cell: CellView;
}) {
  const { cell } = props;
  const observableCell = useObserve(cell);
  if (cell.model.type === 'markdown') {
    return <CellInput cell={observableCell} />;
  } else {
    return <CellOutput cell={observableCell} />;
  }
});

const DndCellItemRenderInner = forwardRef(function DndCellItemRender(
  props: DndItemProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { cell } = props;
  const observableCell = useObserve(cell);
  const appInstance = useInject<LibroAppView>(ViewInstance);
  const instance = appInstance.libroView;
  const hasErrorOutputs = hasErrorOutput(observableCell);
  const hasCellHidden = useMemo(() => {
    return observableCell.hasCellHidden();
  }, [observableCell]);

  const classNames = [
    'libro-dnd-cell',
    { 'command-mode': instance?.model.commandMode },
    { 'edit-mode': !instance?.model.commandMode },
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
        <DndCellItemContent cell={cell} />
      </div>
    </div>
  );
});
export const DndCellItemRender = memo(DndCellItemRenderInner);
