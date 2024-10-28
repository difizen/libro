import type { CellView } from '@difizen/libro-jupyter';
import { useInject, ViewManager, ViewRender } from '@difizen/mana-app';
import { useEffect, useState } from 'react';
import './index.less';

import type { LibroAINativeForCellView } from './ai-native-for-cell-view.js';
import { LibroAINativeService } from './ai-native-service.js';

export function LibroAINativeCellTopBlank({ cell }: { cell: CellView }) {
  const viewManager = useInject<ViewManager>(ViewManager);

  const [aiNativeForCellView, setAiNativeForCellView] =
    useState<LibroAINativeForCellView>();
  const libroAINativeService = useInject<LibroAINativeService>(LibroAINativeService);

  useEffect(() => {
    libroAINativeService
      .getOrCreateLibroAINativeForCellView(cell.id, cell)
      .then((view) => {
        setAiNativeForCellView(view);
        return;
      })
      .catch(() => {
        //
      });
  }, [
    cell,
    cell.id,
    libroAINativeService,
    libroAINativeService.libroAINativeForCellViewMap,
    viewManager,
  ]);

  if (!aiNativeForCellView) {
    return null;
  }

  return (
    <div className="libro-ai-native-output-top">
      <ViewRender view={aiNativeForCellView}></ViewRender>
    </div>
  );
}
