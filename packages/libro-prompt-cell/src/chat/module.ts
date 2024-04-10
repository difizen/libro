import { ManaModule } from '@difizen/mana-app';

import { ChatChannel } from './chat-channel.js';
import { ChatCommandContribution } from './chat-command.js';
import { ChatHandler } from './chat-handler.js';
import { ChatMessage } from './chat-message.js';
import { ChatObject } from './chat-object.js';
import {
  ChatChannelFactory,
  ChatMessageFactory,
  ChatObjectFactory,
  ChatRecordFactory,
} from './chat-protocol.js';
import { ChatRecord } from './chat-record.js';
import { ChatScript } from './chat-scripts.js';
import { ChatSlotContribution } from './chat-slot-contribution.js';
import { ChatViewCache } from './chat-view-cache.js';
import { ChatViewManager } from './chat-view-manager.js';
import { ChatView } from './chat-view.js';

export const LibroChatModule = ManaModule.create()
  .register(
    ChatView,
    ChatScript,
    ChatHandler,
    ChatSlotContribution,
    ChatCommandContribution,
    ChatViewCache,
    ChatViewManager,
    ChatMessage,
    {
      token: ChatMessageFactory,
      useFactory: ChatMessage.toFactory,
    },
    ChatRecord,
    {
      token: ChatRecordFactory,
      useFactory: ChatRecord.toFactory,
    },
    ChatObject,
    {
      token: ChatObjectFactory,
      useFactory: ChatObject.toFactory,
    },
    ChatChannel,
    {
      token: ChatChannelFactory,
      useFactory: ChatChannel.toFactory,
    },
  )
  .dependOn();
