import type { LanguageSpecRegistry } from '@difizen/libro-code-editor';
import { LanguageSpecContribution } from '@difizen/libro-code-editor';
import type { CellMeta, CellModel, CellOptions } from '@difizen/libro-jupyter';
import { CellModelContribution, CellViewContribution } from '@difizen/libro-jupyter';
import { inject } from '@difizen/libro-common/app';
import { singleton } from '@difizen/libro-common/app';

import { LibroSqlCellModelFactory } from './libro-sql-cell-protocol.js';
import { LibroSqlCellView } from './libro-sql-cell-view.js';

@singleton({
  contrib: [CellModelContribution, CellViewContribution, LanguageSpecContribution],
})
export class SqlCellContribution
  implements CellModelContribution, CellViewContribution, LanguageSpecContribution
{
  @inject(LibroSqlCellModelFactory)
  sqlCellModelFactory: LibroSqlCellModelFactory;

  cellMeta: CellMeta = {
    type: 'sql',
    name: 'SQL',
    order: 'e',
    nbformatType: 'code',
  };

  canHandle(options: CellOptions, libroType?: string): number {
    return libroType === this.cellMeta.type ? 2000 : -1;
  }

  async createModel(options: CellOptions): Promise<CellModel> {
    const model = this.sqlCellModelFactory(options);
    return model;
  }

  view = LibroSqlCellView;

  registerLanguageSpec = (register: LanguageSpecRegistry) => {
    register.registerLanguageSpec({
      name: 'SQL',
      language: 'sql-odps',
      mime: 'application/vnd.libro.sql+json',
      ext: ['.sql'],
    });
  };
}
