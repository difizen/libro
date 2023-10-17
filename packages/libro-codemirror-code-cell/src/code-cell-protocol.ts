import type { CellOptions } from '@difizen/libro-core';

import type { LibroCodeCellModel } from './code-cell-model.js';

export type CodeCellModelFactory = (options: CellOptions) => LibroCodeCellModel;
export const CodeCellModelFactory = Symbol('CodeCellModelFactory');
