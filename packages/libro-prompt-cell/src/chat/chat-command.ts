import type { CellView } from '@difizen/libro-core';
import { LibroCommandRegister, LibroView } from '@difizen/libro-core';
import type { Command, CommandRegistry, ToolbarRegistry } from '@difizen/mana-app';
import { ToolbarContribution } from '@difizen/mana-app';
import { ConfigurationService } from '@difizen/mana-app';
import { SlotViewManager } from '@difizen/mana-app';
import { inject, ViewManager } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';
import { CommandContribution } from '@difizen/mana-app';

import { ChatHandler } from './chat-handler.js';

export const ChatCommands: Record<string, Command & { keybind?: string }> = {
  Open: {
    id: 'libro-chat-open',
    label: '打开聊天',
  },
  Toggle: {
    id: 'libro-chat-toggle',
    label: '切换聊天',
  },
};

@singleton({ contrib: [CommandContribution, ToolbarContribution] })
export class ChatCommandContribution
  implements CommandContribution, ToolbarContribution
{
  @inject(ViewManager) viewManager: ViewManager;
  @inject(SlotViewManager) protected slotManager: SlotViewManager;
  @inject(ConfigurationService) protected config: ConfigurationService;
  @inject(LibroCommandRegister) protected readonly libroCommand: LibroCommandRegister;
  @inject(ChatHandler) protected readonly chatDataModel: ChatHandler;

  registerToolbarItems(registry: ToolbarRegistry): void {
    //
  }

  registerCommands(commands: CommandRegistry): void {
    this.libroCommand.registerLibroCommand(commands, ChatCommands['Toggle'], {
      execute: (cell?: CellView, libro?: LibroView) => {
        if (libro) {
          this.chatDataModel.toggleChat(libro, cell);
        }
      },
      isEnabled: (cell, libro) => {
        if (!libro || !(libro instanceof LibroView)) {
          return false;
        }
        return true;
      },
    });
  }
}
