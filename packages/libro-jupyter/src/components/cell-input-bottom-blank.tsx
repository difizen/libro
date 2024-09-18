import type { CellView } from '@difizen/libro-core';
import { LibroEditableExecutableCellView, LibroOutputArea } from '@difizen/libro-core';
import { useObserve } from '@difizen/mana-app';

import { isWaitingExecute } from '../utils/index.js';

export function CellInputBottomBlank({ cell }: { cell: CellView }) {
  const observableCell = useObserve(cell) as LibroEditableExecutableCellView;

  if (
    !(cell instanceof LibroEditableExecutableCellView) ||
    !(observableCell.outputArea instanceof LibroOutputArea)
  ) {
    return null;
  }

  const outputs = observableCell.outputArea.outputs;
  const hasNoneOutput = !outputs || outputs.length === 0;

  // 有output时 或者 没有被执行过，不显示input底部的空白
  if (
    hasNoneOutput &&
    (observableCell.model.executeCount || isWaitingExecute(observableCell.model))
  ) {
    return <div className="libro-cell-bottom-blank" />;
  }

  return null;
}
