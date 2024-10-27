import type { CellView } from '@difizen/libro-jupyter';
import { useInject, ViewManager, ViewRender } from '@difizen/mana-app';
import { useEffect, useState } from 'react';

import { LibroAINativeForCellView } from './ai-native-for-cell-view.js';

export function LibroAINativeCellTopBlank({ cell }: { cell: CellView }) {
  const viewManager = useInject<ViewManager>(ViewManager);

  const [aiNativeForCellView, setAiNativeForCellView] =
    useState<LibroAINativeForCellView>();

  useEffect(() => {
    viewManager
      .getOrCreateView(LibroAINativeForCellView, { id: cell.id })
      .then((view) => {
        setAiNativeForCellView(view);
        return;
      })
      .catch(() => {
        //
      });
  }, [cell.id, viewManager]);

  if (!aiNativeForCellView) {
    return null;
  }

  return <ViewRender view={aiNativeForCellView}></ViewRender>;
}
