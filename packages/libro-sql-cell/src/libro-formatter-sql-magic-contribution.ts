/* eslint-disable @typescript-eslint/no-unused-vars */
import { concatMultilineString } from '@difizen/libro-common';
import { FormatterContribution } from '@difizen/libro-jupyter';
import type {
  DefaultEncodedFormatter,
  DefaultDecodedFormatter,
} from '@difizen/libro-jupyter';
import { singleton } from '@difizen/mana-app';

export interface SqlDecodedFormatter extends DefaultDecodedFormatter {
  result_variable?: string;
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
    const sqlEncodedValue = `%%sql \n{"result_variable":"${source.result_variable}", "sql_script":"${source.value}"}`;
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
      const runValue = JSON.parse(run);
      const result_variable: string = runValue.result_variable;
      const codeValue: string = runValue.sql_script;
      return {
        result_variable,
        value: codeValue,
      };
    }
    return {
      value: '',
    };
  };

  validate = (source: SqlDecodedFormatter): source is SqlDecodedFormatter => {
    return 'result_variable' in source && 'sql_script' in source;
  };
}
