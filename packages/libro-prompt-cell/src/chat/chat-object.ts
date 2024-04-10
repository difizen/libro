import type { Syringe } from '@difizen/mana-app';
import { transient } from '@difizen/mana-app';
import { inject } from '@difizen/mana-app';
import { prop } from '@difizen/mana-app';

import type { IChatObject } from './chat-protocol.js';
import { ChatObjectOptions } from './chat-protocol.js';

@transient()
export class ChatObject implements IChatObject {
  @prop()
  name: string;
  @prop()
  type: string;
  @prop()
  order: number;
  @prop()
  key: string;
  @prop()
  disabled?: boolean | undefined;

  constructor(@inject(ChatObjectOptions) obj: ChatObjectOptions) {
    this.name = obj.name || '';
    this.type = obj.type || '';
    this.order = obj.order || 0;
    this.key = obj.key || '';
  }

  static fromKey(key: string, options: Partial<IChatObject> = {}): ChatObject {
    const [type, name] = key.split(':');
    return new ChatObject({
      name,
      type,
      key,
      order: 0,
      disabled: true,
      ...options,
    });
  }

  static toFactory = (ctx: Syringe.Context) => {
    return (obj: ChatObjectOptions) => {
      const child = ctx.container.createChild();
      child.register({ token: ChatObjectOptions, useValue: obj });
      return ctx.container.get(ChatObject);
    };
  };
}
