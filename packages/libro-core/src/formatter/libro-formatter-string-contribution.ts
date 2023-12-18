/* eslint-disable @typescript-eslint/no-unused-vars */
import { concatMultilineString } from '@difizen/libro-common';
import { singleton } from '@difizen/mana-app';

import type { DefaultEncodedFormatter } from './libro-formatter-protocol.js';
import {
  DefaultDecodedFormatter,
  FormatterContribution,
} from './libro-formatter-protocol.js';

@singleton({ contrib: FormatterContribution })
export class FormatterStringContribution
  implements FormatterContribution<DefaultDecodedFormatter>
{
  formatter = 'formatter-string';
  formatterOptions?: object;

  canHandle = (libroFormatter: string) => {
    if (libroFormatter === this.formatter) {
      return 100;
    }
    return 1;
  };

  encode = (source: DefaultDecodedFormatter) => {
    return {
      source: source.value,
      metadata: {
        libroFormatter: 'formatter-string',
      },
    };
  };

  decode = (formatterValue: DefaultEncodedFormatter) => {
    return { value: concatMultilineString(formatterValue.source) };
  };

  validate = (source: DefaultDecodedFormatter): source is DefaultDecodedFormatter => {
    return DefaultDecodedFormatter.is(source);
  };
}
