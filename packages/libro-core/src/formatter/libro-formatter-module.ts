import { ManaModule } from '@difizen/mana-app';

import { FormatterJsonContribution } from './libro-formatter-json-contribution.js';
import { LibroFormatterManager } from './libro-formatter-manager.js';
import {
  FormatterContribution,
  FormatterTransContribution,
} from './libro-formatter-protocol.js';
import { FormatterStringContribution } from './libro-formatter-string-contribution.js';
import { FormatterTransDefaultContribution } from './libro-formatter-trans-default-contribution.js';

export const LibroFormatterModule = ManaModule.create()
  .contribution(FormatterContribution, FormatterTransContribution)
  .register(
    LibroFormatterManager,
    FormatterStringContribution,
    FormatterJsonContribution,
    FormatterTransDefaultContribution,
  );
