import type { Syringe } from '@difizen/mana-app';
import { inject } from '@difizen/mana-app';
import { prop, transient } from '@difizen/mana-app';

import type { IChatMessage } from './chat-protocol.js';
import { ChatMessageOptions } from './chat-protocol.js';

@transient()
export class ChatMessage implements IChatMessage {
  @prop()
  type: string;
  @prop()
  from: string;
  @prop()
  role?: string;
  @prop()
  at: string;
  @prop()
  message: string;

  constructor(@inject(ChatMessageOptions) obj: ChatMessageOptions) {
    this.type = obj.type || '';
    this.from = obj.from || '';
    this.role = obj.role;
    this.at = obj.at || '';
    this.message = obj.message || '';
  }

  static toFactory = (ctx: Syringe.Context) => {
    return (obj: ChatMessageOptions) => {
      const child = ctx.container.createChild();
      child.register({ token: ChatMessageOptions, useValue: obj });
      return ctx.container.get(ChatMessage);
    };
  };
}
