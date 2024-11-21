import type { PartialJSONObject } from '@difizen/libro-common';
import type { CellOptions } from '@difizen/libro-core';

import type { LibroPromptCellModel } from './prompt-cell-model.js';

export type LibroPromptCellModelFactory = (
  options: CellOptions,
) => LibroPromptCellModel;
export const LibroPromptCellModelFactory = Symbol('LibroPromptCellModelFactory');

export interface InterpreterMeta extends PartialJSONObject {
  interpreter_code?: string;
  interpreter_text?: string;
}
