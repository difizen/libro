import type { CellView } from '@difizen/libro-jupyter';
import type { IChatMessageItem } from '@difizen/magent-chat';

export interface IAINativeForCellViewOption {
  cell: CellView;
  [key: string]: any;
}

export interface LibroAINativeChatMessageItemOption extends IChatMessageItem {
  chat_key: string;
}
