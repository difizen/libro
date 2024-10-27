import type { CellView } from '@difizen/libro-jupyter';

export interface IAINativeForCellViewOption {
  cell: CellView;
  [key: string]: any;
}
