/** @format */

import { concatMultilineString } from '@difizen/libro-common';
import { FormatterContribution } from '@difizen/libro-jupyter';
import type {
  DefaultEncodedFormatter,
  DefaultDecodedFormatter,
} from '@difizen/libro-jupyter';
import { singleton } from '@difizen/libro-common/app';

export interface SqlDecodedFormatter extends DefaultDecodedFormatter {
  result_variable?: string;
  db_id?: string;
}

@singleton({ contrib: FormatterContribution })
export class FormatterSqlMagicContribution
  implements FormatterContribution<SqlDecodedFormatter>
{
  formatter = 'formatter-sql-magic';
  formatterOptions?: object;

  canHandle = (libroFormatter: string) => {
    return libroFormatter === this.formatter ? 100 : 1;
  };
  encode = (source: SqlDecodedFormatter) => {
    const sqlJson = {
      result_variable: source.result_variable,
      db_id: source.db_id,
      sql_script: source.value,
    };
    const sqlEncodedValue = `%%sql \n${JSON.stringify(sqlJson)}`;
    return {
      source: sqlEncodedValue,
      metadata: {
        libroFormatter: this.formatter,
      },
    };
  };
  decode = (formatterValue: DefaultEncodedFormatter) => {
    const value = concatMultilineString(formatterValue.source);
    if (value.startsWith('%%sql \n')) {
      const run = value.split('%%sql \n')[1];
      try {
        const runValue = JSON.parse(run);
        const result_variable: string = runValue.result_variable;
        const db_id: string = runValue.db_id;
        const codeValue: string = runValue.sql_script;
        return {
          result_variable,
          value: codeValue,
          db_id,
        };
      } catch (e) {
        console.warn('🚀 ~ e:', e);
      }
    }
    return {
      value: '',
    };
  };

  validate = (source: SqlDecodedFormatter): source is SqlDecodedFormatter => {
    return 'result_variable' in source && 'sql_script' in source && 'db_id' in source;
  };
}
