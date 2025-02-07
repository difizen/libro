import type {
  LibroView,
  LibroExtensionSlotFactory,
  LibroSlot,
} from '@difizen/libro-jupyter';
import { LibroExtensionSlotContribution } from '@difizen/libro-jupyter';
import { ViewManager } from '@difizen/libro-common/mana-app';
import { inject, singleton } from '@difizen/libro-common/mana-app';

import { LibroAINativeService } from './ai-native-service.js';
import { LibroChatView } from './chat-view.js';

@singleton({ contrib: [LibroExtensionSlotContribution] })
export class LibroAIChatSlotContribution implements LibroExtensionSlotContribution {
  @inject(ViewManager) viewManager: ViewManager;
  @inject(LibroAINativeService) libroAINativeService: LibroAINativeService;

  public readonly slot: LibroSlot = 'right';

  factory: LibroExtensionSlotFactory = async (libro: LibroView) => {
    const view = await this.viewManager.getOrCreateView(LibroChatView, {
      parentId: libro.id,
    });
    view.parent = libro;
    this.libroAINativeService.chatViewMap.set(libro.id, view);
    this.libroAINativeService.showChatMap.set(libro.id, false);
    view.onDisposed(() => {
      this.libroAINativeService.chatViewMap.delete(libro.id);
    });
    return view;
  };
  viewOpenOption = {
    reveal: false,
    order: 'a',
  };
}
