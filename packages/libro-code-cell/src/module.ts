import { CodeEditorModule } from '@difizen/libro-code-editor';
import { CellOptions } from '@difizen/libro-core';
import { ManaModule } from '@difizen/mana-app';

import { CodeEditorCellContribution } from './code-cell-contribution.js';
import { LibroCodeCellModel } from './code-cell-model.js';
import { CodeCellModelFactory } from './code-cell-protocol.js';
import { LibroCodeCellView } from './code-cell-view.js';

export const CodeCellModule = ManaModule.create()
  .register(CodeEditorCellContribution, LibroCodeCellView, LibroCodeCellModel, {
    token: CodeCellModelFactory,
    useFactory: (ctx) => {
      return (options: CellOptions) => {
        const child = ctx.container.createChild();
        child.register({
          token: CellOptions,
          useValue: options,
        });
        const model = child.get(LibroCodeCellModel);
        return model;
      };
    },
  })
  .dependOn(CodeEditorModule);
