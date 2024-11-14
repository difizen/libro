import { CellOptions, LibroModule, OutputModule } from '@difizen/libro-core';
import { LibroRenderMimeModule } from '@difizen/libro-rendermime';
import { ManaModule } from '@difizen/mana-app';

import { FormatterPromptMagicContribution } from './libro-formatter-prompt-magic-contribution.js';
import { LibroPromptCellCommandContribution } from './prompt-cell-command-contribution.js';
import { PromptCellContribution } from './prompt-cell-contribution.js';
import { LibroPromptCellModel } from './prompt-cell-model.js';
import { LibroPromptCellModelFactory } from './prompt-cell-protocol.js';
import { PromptScript } from './prompt-cell-script.js';
import { LibroPromptCellView } from './prompt-cell-view.js';
import { LibroPromptOutputMimeTypeContribution } from './prompt-output-rendermime-contribution.js';

export const LibroPromptCellModuleSetting = {
  loadable: true,
};

export const LibroPromptCellModule = ManaModule.create()
  .register(
    PromptCellContribution,
    PromptScript,
    LibroPromptCellView,
    LibroPromptCellModel,
    LibroPromptOutputMimeTypeContribution,
    LibroPromptCellCommandContribution,
    FormatterPromptMagicContribution,
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
  .canload(() => Promise.resolve(LibroPromptCellModuleSetting.loadable))
  .dependOn(LibroModule, OutputModule, LibroRenderMimeModule);
