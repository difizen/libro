import { ManaModule } from '@difizen/mana-app';

import { ChatCommandContribution } from './chat-command.js';
import { ChatHandler } from './chat-handler.js';
import { ChatScript } from './chat-scripts.js';
import { ChatSlotContribution } from './chat-slot-contribution.js';
import { ChatView } from './chat-view.js';

export const LibroChatModule = ManaModule.create()
  .register(
    ChatView,
    ChatScript,
    ChatHandler,
    ChatSlotContribution,
    ChatCommandContribution,
  )
  .dependOn();
