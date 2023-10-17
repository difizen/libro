import { ManaModule } from '@difizen/mana-app';

import { CellOptions } from '../libro-protocol.js';

import { LibroCellContribution } from './libro-cell-contribution.js';
import { LibroCellModel } from './libro-cell-model.js';
import {
  CellModelContribution,
  CellModelFactory,
  CellViewContribution,
} from './libro-cell-protocol.js';
import { LibroCellService } from './libro-cell-service.js';
import { LibroCellView } from './libro-cell-view.js';

/**
 * 基础的cell实现，作为实现更复杂的cell的参考，一般不用加载到实际应用中
 */
export const LibroBaseCellModule = ManaModule.create()
  .register(LibroCellContribution, LibroCellView, LibroCellModel)
  .register({
    token: CellModelFactory,
    useFactory: (ctx) => {
      return (options: CellOptions) => {
        const child = ctx.container.createChild();
        child.register({
          token: CellOptions,
          useValue: options,
        });
        const model = child.get(LibroCellModel);
        return model;
      };
    },
  });

/**
 * cell 定义
 */
export const LibroCellModule = ManaModule.create()
  .contribution(CellViewContribution, CellModelContribution)
  .register(LibroCellService);
