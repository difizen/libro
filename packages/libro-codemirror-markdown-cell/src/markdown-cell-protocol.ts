import type { CellOptions } from '@difizen/libro-core';

import type { MarkdownCellModel } from './markdown-cell-model.js';

export type MarkdownCellModelFactory = (options: CellOptions) => MarkdownCellModel;
export const MarkdownCellModelFactory = Symbol('MarkdownCellModelFactory');
