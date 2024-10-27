import { CellOutputTopProvider, ErrorOutputModel } from '@difizen/libro-jupyter';
import { ChatView } from '@difizen/magent-chat';
import { LibroChatModule, LibroChatService } from '@difizen/magent-libro';
import { ManaModule } from '@difizen/mana-app';

import { LibroAINativeCommandContribution } from './ai-native-command-contribution.js';
import { LibroAINativeForCellView } from './ai-native-for-cell-view.js';
import { LibroAINativeCellTopBlank } from './ai-native-output-top.js';
import { LibroAINativeService } from './ai-native-service.js';
import { LibroAIChatSlotContribution } from './chat-slot-contribution.js';
import { LibroChatView } from './chat-view.js';
import { AIErrorOutputModel } from './error-output-model.js';
import { LibroAIChatMessageItemModel } from './libro-ai-msg-item-model.js';
import { LibroAINativeChatService } from './libro-ai-native-chat-service.js';
import { LibroAiNativeChatView } from './libro-ai-native-chat-view.js';
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
      token: ChatView,
      useClass: LibroAiNativeChatView,
    },
    {
      token: LibroChatService,
      useClass: LibroAINativeChatService,
    },
    {
      token: CellOutputTopProvider,
      useValue: LibroAINativeCellTopBlank,
    },
  )
  .dependOn(LibroChatModule);
