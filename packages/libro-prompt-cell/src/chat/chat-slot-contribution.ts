import type {
  LibroView,
  LibroExtensionSlotFactory,
  LibroSlot,
} from '@difizen/libro-core';
import { LibroExtensionSlotContribution } from '@difizen/libro-core';
import { inject, singleton } from '@difizen/mana-app';

import { ChatViewManager } from './chat-view-manager.js';

@singleton({ contrib: [LibroExtensionSlotContribution] })
export class ChatSlotContribution implements LibroExtensionSlotContribution {
  @inject(ChatViewManager) manager: ChatViewManager;

  public readonly slot: LibroSlot = 'right';

  factory: LibroExtensionSlotFactory = async (libro: LibroView) => {
    return this.manager.getOrCreateView(libro);
  };
}
