import { ErrorOutputModel } from '@difizen/libro-jupyter';
import { LibroChatModule } from '@difizen/magent-libro';
import { ManaModule } from '@difizen/mana-app';

import { LibroAINativeCommandContribution } from './ai-native-command-contribution.js';
import { LibroAIChatSlotContribution } from './chat-slot-contribution.js';
import { LibroChatView } from './chat-view.js';
import { AIErrorOutputModel } from './error-output-model.js';
import { LibroAINativeColorRegistry } from './libro-ai-native-color-registry.js';

export const LibroAINativeModule = ManaModule.create()
  .register(
    LibroAINativeColorRegistry,
    LibroChatView,
    LibroAIChatSlotContribution,
    LibroAINativeCommandContribution,
    {
      token: ErrorOutputModel,
      useClass: AIErrorOutputModel,
    },
  )
  .dependOn(LibroChatModule);
