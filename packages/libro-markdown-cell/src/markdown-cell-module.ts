import { CellOptions } from '@difizen/libro-core';
import { MarkdownModule } from '@difizen/libro-markdown';
import { ManaModule } from '@difizen/mana-app';

import { MarkdownCellContribution } from './markdown-cell-contribution.js';
import { MarkdownCellModel } from './markdown-cell-model.js';
import { MarkdownCellModelFactory } from './markdown-cell-protocol.js';
import { MarkdownCellView } from './markdown-cell-view.js';

export const MarkdownCellModule = ManaModule.create()
  .register(MarkdownCellContribution, MarkdownCellView, MarkdownCellModel)
  .register({
    token: MarkdownCellModelFactory,
    useFactory: (ctx) => {
      return (options: CellOptions) => {
        const child = ctx.container.createChild();
        child.register({
          token: CellOptions,
          useValue: options,
        });
        const model = child.get(MarkdownCellModel);
        return model;
      };
    },
  })
  .dependOn(MarkdownModule);
