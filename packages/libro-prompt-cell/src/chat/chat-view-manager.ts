import type { LibroView } from '@difizen/libro-core';
import { inject, singleton, ViewManager } from '@difizen/mana-app';

import { ChatViewCache } from './chat-view-cache.js';
import { ChatView } from './chat-view.js';

@singleton()
export class ChatViewManager {
  @inject(ViewManager) viewManager: ViewManager;
  @inject(ChatViewCache) viewCache: ChatViewCache;

  getOrCreateView = async (libro: LibroView) => {
    const view = await this.viewManager.getOrCreateView(ChatView, {
      parentId: libro.id,
    });
    view.parent = libro;
    libro.onDisposed(() => {
      view.dispose();
    });
    this.viewCache.setView(libro.id, view);
    view.onDisposed(() => {
      this.viewCache.deleteView(libro.id);
    });
    return view;
  };
}
