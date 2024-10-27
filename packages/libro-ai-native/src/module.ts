import { CellOutputTopProvider, ErrorOutputModel } from '@difizen/libro-jupyter';
import { LibroChatModule } from '@difizen/magent-libro';
import { ManaModule } from '@difizen/mana-app';

import { LibroAINativeCommandContribution } from './ai-native-command-contribution.js';
import { LibroAINativeForCellView } from './ai-native-for-cell-view.js';
import { LibroAINativeCellTopBlank } from './ai-native-output-top.js';
import { LibroAINativeService } from './ai-native-service.js';
import { LibroAIChatSlotContribution } from './chat-slot-contribution.js';
import { LibroChatView } from './chat-view.js';
import { AIErrorOutputModel } from './error-output-model.js';
import { LibroAIChatMessageItemModel } from './libro-ai-msg-item-model.js';
import { LibroAINativeColorRegistry } from './libro-ai-native-color-registry.js';

export const LibroAINativeModule = ManaModule.create()
  .register(
    LibroAINativeColorRegistry,
    LibroChatView,
    LibroAIChatSlotContribution,
    LibroAINativeCommandContribution,
    LibroAINativeService,
    LibroAIChatMessageItemModel,
    LibroAINativeForCellView,
    {
      token: ErrorOutputModel,
      useClass: AIErrorOutputModel,
    },
    {
      token: CellOutputTopProvider,
      useValue: LibroAINativeCellTopBlank,
    },
  )
  .dependOn(LibroChatModule);
