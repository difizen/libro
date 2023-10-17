import { ManaModule } from '@difizen/mana-app';

import { LibroAddCellSlotContribution } from './libro-add-cell-slot-contribution.js';
import { LibroAddCellView } from './libro-add-cell-view.js';

export const LibroAddCellModule = ManaModule.create().register(
  LibroAddCellSlotContribution,
  LibroAddCellView,
);
