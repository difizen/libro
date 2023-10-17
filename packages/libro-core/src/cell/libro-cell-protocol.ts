import type { IBaseCell, ICell, ICellMetadata } from '@difizen/libro-common';
import type { MaybePromise, Newable } from '@difizen/mana-app';
import { Syringe } from '@difizen/mana-app';

import type { CellModel, CellOptions, CellView } from '../libro-protocol.js';

export type LibroCellMetadata = ICellMetadata & {
  libroCellType?: string;
};
export interface LibroCustomCell extends IBaseCell {
  metadata: Partial<LibroCellMetadata>;
}
export type LibroCell = LibroCustomCell | ICell;

export type CellModelFactory = (options: CellOptions) => CellModel;
export const CellModelFactory = Symbol('CellModelFactory');

export const getLibroCellType = (options: CellOptions) => {
  return (options.cell.metadata?.libroCellType as string) ?? options.cell.cell_type;
};

export const CellModelContribution = Syringe.defineToken('CellModelContribution');
export interface CellModelContribution {
  cellMeta: CellMeta;
  canHandle: (options: CellOptions, libroType?: string) => number;
  createModel: (options: CellOptions) => MaybePromise<CellModel>;
  getDefaultCellOption?: () => CellOptions;
}

export const CellViewContribution = Syringe.defineToken('CellViewContribution');
export interface CellViewContribution {
  canHandle: (options: CellOptions) => number;
  view: Newable<CellView>;
}

export interface CellMeta {
  type: string;
  name: string;
  order: string;
  nbformatType?: string;
}

//

export const CellService = Symbol('CellService');
export interface CellService {
  cellsMeta: CellMeta[];
  getModelFromCache: (groupId: string, modelId: string) => CellModel | undefined;
  getOrCreateModel: (options: CellOptions, cacheGroupId?: string) => Promise<CellModel>;
  getOrCreateView: (options: CellOptions, parentId: string) => Promise<CellView>;
  findModelProvider: (options: CellOptions) => CellModelContribution | undefined;
  findViewProvider: (options: CellOptions) => CellViewContribution | undefined;
}
