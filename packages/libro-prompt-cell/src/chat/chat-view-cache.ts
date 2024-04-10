import { singleton } from '@difizen/mana-app';

import type { ChatView } from './chat-view.js';

@singleton()
export class ChatViewCache {
  protected viewMap: Map<string, ChatView> = new Map();

  setView(libroId: string, view: ChatView) {
    this.viewMap.set(libroId, view);
  }
  getView(libroId: string) {
    return this.viewMap.get(libroId);
  }
  deleteView(libroId: string) {
    this.viewMap.delete(libroId);
  }
}
