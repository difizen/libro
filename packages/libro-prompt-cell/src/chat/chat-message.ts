import { prop } from '@difizen/mana-app';

export class ChatMessage {
  @prop()
  type: string;
  @prop()
  from: string;
  @prop()
  role: string;
  @prop()
  at: string;
  @prop()
  message: string;
}
