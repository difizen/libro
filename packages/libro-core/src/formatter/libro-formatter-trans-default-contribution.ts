/* eslint-disable @typescript-eslint/no-unused-vars */
import { singleton } from '@difizen/mana-app';

import type { DefaultDecodedFormatter } from './libro-formatter-protocol.js';
import { FormatterTransContribution } from './libro-formatter-protocol.js';

@singleton({ contrib: FormatterTransContribution })
export class FormatterTransDefaultContribution
  implements
    FormatterTransContribution<DefaultDecodedFormatter, DefaultDecodedFormatter>
{
  priority = 1;

  decodedValueTrans = (source: DefaultDecodedFormatter) => source;
}
