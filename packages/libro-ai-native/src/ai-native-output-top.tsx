import type { CellView } from '@difizen/libro-jupyter';
import { getOrigin, useInject, ViewManager, ViewRender } from '@difizen/mana-app';
import { useEffect, useState } from 'react';
import './index.less';

import { LibroAINativeForCellView } from './ai-native-for-cell-view.js';

export function LibroAINativeCellTopBlank({ cell }: { cell: CellView }) {
  const viewManager = useInject<ViewManager>(ViewManager);

  const [aiNativeForCellView, setAiNativeForCellView] =
    useState<LibroAINativeForCellView>();

  useEffect(() => {
    viewManager
      .getOrCreateView(LibroAINativeForCellView, { id: cell.id, cell: getOrigin(cell) })
      .then((view) => {
        setAiNativeForCellView(view);
        return;
      })
      .catch(() => {
        //
      });
  }, [cell, cell.id, viewManager]);

  if (!aiNativeForCellView) {
    return null;
  }

  return (
    <div className="libro-ai-native-output-top">
      <ViewRender view={aiNativeForCellView}></ViewRender>
    </div>
  );
}
