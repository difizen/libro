import type { CellOptions } from '@difizen/libro-jupyter';

import type { LibroGeneralDemoCellModel } from './libro-general-demo-cell-model.js';

export type LibroGeneralDemoCellModelFactory = (
  options: CellOptions,
) => LibroGeneralDemoCellModel;
export const LibroGeneralDemoCellModelFactory = Symbol(
  'LibroGeneralDemoCellModelFactory',
);
