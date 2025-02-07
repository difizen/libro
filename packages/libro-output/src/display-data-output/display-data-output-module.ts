import { OutputModule } from '@difizen/libro-core';
import { LibroRenderMimeModule } from '@difizen/libro-rendermime';
import { ManaModule } from '@difizen/libro-common/mana-app';

import { DisplayDataOutputContribution } from './display-data-output-contribution.js';
import { DisplayDataOutputModel } from './display-data-output-model.js';

export const DisplayDataOutputModule = ManaModule.create()
  .register(DisplayDataOutputModel, DisplayDataOutputContribution)
  .dependOn(OutputModule, LibroRenderMimeModule);
