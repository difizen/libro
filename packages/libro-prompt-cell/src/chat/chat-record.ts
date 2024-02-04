import { prop } from '@difizen/mana-app';

import type { ChatMessage } from './chat-message.js';

export class ChatRecord {
  @prop()
  name: string;
  @prop()
  messages: ChatMessage[];
  @prop()
  members: string[];
}
