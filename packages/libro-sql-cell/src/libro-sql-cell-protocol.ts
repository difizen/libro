import type { CellOptions, CellView } from '@difizen/libro-jupyter';

import type { LibroSqlCellModel } from './libro-sql-cell-model.js';

export type LibroSqlCellModelFactory = (options: CellOptions) => LibroSqlCellModel;
export const LibroSqlCellModelFactory = Symbol('LibroSqlCellModelFactory');

export interface VisAnalysis {
  addAnalysisCell: (cellView: CellView, dfName?: string) => void;
}
