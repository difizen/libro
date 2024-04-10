import type { Syringe } from '@difizen/mana-app';
import { transient } from '@difizen/mana-app';
import { prop } from '@difizen/mana-app';

import type { IChatObject, IChatRecord } from './chat-protocol.js';

/**
 * ChatChannel
 */
@transient()
export class ChatChannel {
  @prop()
  name?: string;
  @prop()
  objects: IChatObject[] = [];
  @prop()
  records: IChatRecord[] = [];

  static toFactory = (ctx: Syringe.Context) => {
    return () => {
      return ctx.container.get(ChatChannel);
    };
  };
}
