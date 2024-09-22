import type { FC } from 'react';

import type { CellOptions, CellView } from '../libro-protocol.js';

export type CellExecutionTimeProvider = FC<{ cell: CellView }>;

export const CellExecutionTimeProvider = Symbol('CellExecutionTimeProvider');

export type CellInputBottonBlankProvider = FC<{ cell: CellView }>;

export const CellInputBottonBlankProvider = Symbol('CellInputBottonBlankProvider');

export type CellOutputBottomBlankProvider = FC<{ cell: CellView }>;

export const CellOutputBottomBlankProvider = Symbol('CellOutputBottomBlankProvider');

export type CellOutputVisulizationProvider = FC<{ cell: CellView }>;

export const CellOutputVisulizationProvider = Symbol('CellOutputVisulizationProvider');

export type BetweenCellProvider = FC<{
  index: number;
  addCell: (option: CellOptions, position?: number | undefined) => Promise<void>;
}>;

export const BetweenCellProvider = Symbol('BetweenCellProvider');
