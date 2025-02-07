import { ManaModule } from '@difizen/mana-app';
import { LibroEditorDemoCellView } from './libro-editor-demo-cell-view';
import { LibroEditorDemoCellContribution } from './libro-editor-demo-cell-contribution';
import { LibroEditorDemoCellModel } from './libro-editor-demo-cell-model';
import { LibroEditorDemoCellModelFactory } from './libro-editor-demo-cell-protocol';
import { CellOptions } from '@difizen/libro-jupyter';

export const LibroEditorDemoCellModule = ManaModule.create().register(
  LibroEditorDemoCellView,
  LibroEditorDemoCellContribution,
  LibroEditorDemoCellModel,
  {
    token: LibroEditorDemoCellModelFactory,
    useFactory: (ctx) => {
      return (options: CellOptions) => {
        const child = ctx.container.createChild();
        child.register({
          token: CellOptions,
          useValue: options,
        });
        const model = child.get(LibroEditorDemoCellModel);
        return model;
      };
    },
  },
);
