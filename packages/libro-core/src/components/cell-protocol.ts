import type React from 'react';

import type { CellOptions, CellView } from '../libro-protocol.js';

export type CellExecutionTimeProvider = React.FC<{ cell: CellView }>;

export const CellExecutionTimeProvider = Symbol('CellExecutionTimeProvider');

export type CellInputBottonBlankProvider = React.FC<{ cell: CellView }>;

export const CellInputBottonBlankProvider = Symbol('CellInputBottonBlankProvider');

export type CellOutputVisulizationProvider = React.FC<{ cell: CellView }>;

export const CellOutputVisulizationProvider = Symbol('CellOutputVisulizationProvider');

export type BetweenCellProvider = React.FC<{
  index: number;
  addCell: (option: CellOptions, position?: number | undefined) => Promise<void>;
}>;

export const BetweenCellProvider = Symbol('BetweenCellProvider');
