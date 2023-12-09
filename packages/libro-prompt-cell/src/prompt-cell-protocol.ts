import type { CellOptions } from '@difizen/libro-core';

import type { LibroPromptCellModel } from './prompt-cell-model.js';

export type LibroPromptCellModelFactory = (
  options: CellOptions,
) => LibroPromptCellModel;
export const LibroPromptCellModelFactory = Symbol('LibroPromptCellModelFactory');
