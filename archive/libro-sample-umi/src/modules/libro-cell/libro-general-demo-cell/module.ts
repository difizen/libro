import { ManaModule } from '@difizen/mana-app';
import { LibroGeneralDemoCellContribution } from './libro-general-demo-cell-contribution';
import { LibroGeneralDemoCellView } from './libro-general-demo-cell-view';
import { LibroGeneralDemoCellModel } from './libro-general-demo-cell-model';
import { CellOptions } from '@difizen/libro-jupyter';
import { LibroGeneralDemoCellModelFactory } from './libro-general-demo-cell-protocol';

export const LibroGeneralDemoCellModule = ManaModule.create().register(
  LibroGeneralDemoCellContribution,
  LibroGeneralDemoCellView,
  LibroGeneralDemoCellModel,
  {
    token: LibroGeneralDemoCellModelFactory,
    useFactory: (ctx) => {
      return (options: CellOptions) => {
        const child = ctx.container.createChild();
        child.register({
          token: CellOptions,
          useValue: options,
        });
        const model = child.get(LibroGeneralDemoCellModel);
        return model;
      };
    },
  },
);
