/* eslint-disable @typescript-eslint/no-unused-vars */
import { FormatterTransContribution } from '@difizen/libro-jupyter';
import type { DefaultDecodedFormatter } from '@difizen/libro-jupyter';
import { singleton } from '@difizen/libro-common/mana-app';

import type { SqlDecodedFormatter } from './libro-formatter-sql-magic-contribution.js';

@singleton({ contrib: FormatterTransContribution })
export class FormatterStringTransSqlContribution
  implements FormatterTransContribution<DefaultDecodedFormatter, SqlDecodedFormatter>
{
  origin = 'formatter-string';
  target = 'formatter-sql-magic';
  priority = 100;

  decodedValueTrans = (source: DefaultDecodedFormatter) => {
    return {
      ...source,
      result_variable: source['result_variable'] || 'df_from_trans',
    };
  };
}
