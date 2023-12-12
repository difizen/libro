import { CellOptions, LibroModule, OutputModule } from '@difizen/libro-core';
import { LibroRenderMimeModule } from '@difizen/libro-rendermime';
import { ManaModule } from '@difizen/mana-app';

import { PromptCellContribution } from './prompt-cell-contribution.js';
import { LibroPromptCellModel } from './prompt-cell-model.js';
import { LibroPromptOutputArea } from './prompt-cell-output-area.js';
import { LibroPromptCellModelFactory } from './prompt-cell-protocol.js';
import { LibroPromptCellView } from './prompt-cell-view.js';
import { LibroPromptOutputMimeTypeContribution } from './prompt-output-rendermime-contribution.js';

export const LibroPromptCellModule = ManaModule.create()
  .register(
    PromptCellContribution,
    LibroPromptCellView,
    LibroPromptCellModel,
    LibroPromptOutputArea,
    LibroPromptOutputMimeTypeContribution,

    {
      token: LibroPromptCellModelFactory,
      useFactory: (ctx) => {
        return (options: CellOptions) => {
          const child = ctx.container.createChild();
          child.register({
            token: CellOptions,
            useValue: options,
          });
          const model = child.get(LibroPromptCellModel);
          return model;
        };
      },
    },
  )
  .dependOn(LibroModule, OutputModule, LibroRenderMimeModule);
