import { CellOptions, LibroModule } from '@difizen/libro-jupyter';
import { LibroRenderMimeModule } from '@difizen/libro-rendermime';
import { ManaModule } from '@difizen/mana-app';

import { FormatterSqlMagicContribution } from './libro-formatter-sql-magic-contribution.js';
import { FormatterStringTransSqlContribution } from './libro-formatter-sql-trans-contribution.js';
import { LibroSQLCellColorRegistry } from './libro-sql-cell-color-registry.js';
import { SqlCellContribution } from './libro-sql-cell-contribution.js';
import { LibroSqlCellModel } from './libro-sql-cell-model.js';
import { LibroSqlCellModelFactory } from './libro-sql-cell-protocol.js';
import { SqlScript } from './libro-sql-cell-script.js';
import { LibroSqlCellView } from './libro-sql-cell-view.js';

export const LibroSqlCellModule = ManaModule.create()
  .register(
    SqlCellContribution,
    LibroSqlCellView,
    LibroSqlCellModel,
    LibroSQLCellColorRegistry,
    FormatterSqlMagicContribution,
    FormatterStringTransSqlContribution,
    SqlScript,
    {
      token: LibroSqlCellModelFactory,
      useFactory: (ctx) => {
        return (options: CellOptions) => {
          const child = ctx.container.createChild();
          child.register({
            token: CellOptions,
            useValue: options,
          });
          const model = child.get(LibroSqlCellModel);
          return model;
        };
      },
    },
  )
  .dependOn(LibroModule, LibroRenderMimeModule);
