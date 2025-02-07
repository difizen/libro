import { BetweenCellProvider } from '@difizen/libro-core';
import { ManaModule } from '@difizen/libro-common/mana-app';

import { LibroAddBetweenCellCommandContribution } from './add-between-cell-command-contribution.js';
import { LibroWrappedBetweenCellContent } from './add-between-cell.js';

export const LibroBetweenCellModule = ManaModule.create().register(
  {
    token: BetweenCellProvider,
    useValue: LibroWrappedBetweenCellContent,
  },
  LibroAddBetweenCellCommandContribution,
);
