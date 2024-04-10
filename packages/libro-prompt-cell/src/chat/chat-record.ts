import type { Syringe } from '@difizen/mana-app';
import { inject } from '@difizen/mana-app';
import { prop, transient } from '@difizen/mana-app';

import type { ChatMessage } from './chat-message.js';
import type { IChatRecord } from './chat-protocol.js';
import { ChatRecordOptions } from './chat-protocol.js';

export declare namespace ChatRecord {
  export type Options = Partial<IChatRecord>;
}
@transient()
export class ChatRecord implements IChatRecord {
  @prop()
  name: string;
  @prop()
  messages: ChatMessage[];
  @prop()
  members: string[];

  constructor(@inject(ChatRecordOptions) obj: ChatRecordOptions) {
    this.name = obj.name || '';
    this.messages = obj.messages || [];
    this.members = obj.members || [];
  }

  addMessage(message: ChatMessage) {
    this.messages.push(message);
  }

  addMember(member: string) {
    this.members.push(member);
  }

  static toFactory = (ctx: Syringe.Context) => {
    return (obj: ChatRecordOptions) => {
      const child = ctx.container.createChild();
      child.register({ token: ChatRecordOptions, useValue: obj });
      return ctx.container.get(ChatRecord);
    };
  };
}
