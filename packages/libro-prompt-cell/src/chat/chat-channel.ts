import type { ChatRecord } from './chat-record.js';

export class ChatChannel {
  name: string;
  type: string;
  members: string[];
  records: ChatRecord[];
  order: number;
  key: string;
  disabled?: boolean;
}
