import type { CellOptions } from '@difizen/libro-core';

import type { LibroRawCellModel } from './raw-cell-model.js';

export type RawCellModelFactory = (options: CellOptions) => LibroRawCellModel;
export const RawCellModelFactory = Symbol('RawCellModelFactory');
