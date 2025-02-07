import { CellOptions } from '@difizen/libro-core';
import { ManaModule } from '@difizen/libro-common/mana-app';

import { RawCellContribution } from './raw-cell-contribution.js';
import { LibroRawCellModel } from './raw-cell-model.js';
import { RawCellModelFactory } from './raw-cell-protocol.js';
import { LibroRawCellView } from './raw-cell-view.js';

export const RawCellModule = ManaModule.create().register(
  RawCellContribution,
  LibroRawCellView,
  LibroRawCellModel,
  {
    token: RawCellModelFactory,
    useFactory: (ctx) => {
      return (options: CellOptions) => {
        const child = ctx.container.createChild();
        child.register({
          token: CellOptions,
          useValue: options,
        });
        const model = child.get(LibroRawCellModel);
        return model;
      };
    },
  },
);
