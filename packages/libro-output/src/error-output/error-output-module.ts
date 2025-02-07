import { OutputModule } from '@difizen/libro-core';
import { LibroRenderMimeModule } from '@difizen/libro-rendermime';
import { ManaModule } from '@difizen/libro-common/mana-app';

import { ErrorOutputContribution } from './error-output-contribution.js';
import { ErrorOutputModel } from './error-output-model.js';

export const ErrorOutputModule = ManaModule.create()
  .register(ErrorOutputModel, ErrorOutputContribution)
  .dependOn(OutputModule, LibroRenderMimeModule);
