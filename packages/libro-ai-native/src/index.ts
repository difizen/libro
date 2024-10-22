import { ErrorOutputModel } from '@difizen/libro-jupyter';
import { ManaModule } from '@difizen/mana-app';

import { AIErrorOutputModel } from './error-output-model.js';
import { LibroAINativeColorRegistry } from './libro-ai-native-color-registry.js';

export const LibroAINativeModule = ManaModule.create().register(
  LibroAINativeColorRegistry,
  {
    token: ErrorOutputModel,
    useClass: AIErrorOutputModel,
  },
);
