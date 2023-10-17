import { ManaModule } from '@difizen/mana-app';

import { LibroOutputArea } from './output-area.js';
import { DefaultOutputContribution } from './output-contribution.js';
import { LibroOutputModel } from './output-model.js';
import { OutputContribution } from './output-protocol.js';

export const OutputModule = ManaModule.create()
  .contribution(OutputContribution)
  .register(LibroOutputArea, LibroOutputModel, DefaultOutputContribution);
