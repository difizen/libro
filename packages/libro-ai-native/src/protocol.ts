import type { CellView } from '@difizen/libro-jupyter';
// import type { ChatViewOption, IChatMessageItem } from '@difizen/magent-chat';

export interface IAINativeForCellViewOption {
  cell: CellView;
  [key: string]: any;
}

export interface LibroAINativeChatMessageItemOption extends IChatMessageItem {
  chat_key?: string;
}

export interface AiNativeChatViewOption extends ChatViewOption {
  id: string;
  chat_key?: string;
  isCellChat: boolean;
  cell?: CellView;
}
