import { LibroCellView } from '@difizen/libro-jupyter';
import type { CommandRegistry } from '@difizen/mana-app';
import { CommandContribution, inject, singleton } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';

import { LibroAINativeService } from '../ai-native-service.js';

import { AIWidgetCommandRegister } from './ai-widget-command-register.js';
import { AIWidgetCommands } from './command.js';

@singleton({ contrib: CommandContribution })
export class AIWidgetCommandContribution implements CommandContribution {
  @inject(AIWidgetCommandRegister)
  protected readonly widgetCommandRegister: AIWidgetCommandRegister;

  @inject(LibroAINativeService) libroAINativeService: LibroAINativeService;

  registerCommands(command: CommandRegistry) {
    this.widgetCommandRegister.registerAIWidgetCommand(
      command,
      AIWidgetCommands['Optimize'],
      {
        execute: async (code, cell, libro) => {
          if (!cell || !(cell instanceof LibroCellView)) {
            return;
          }
          const libroAINativeForCellView =
            await this.libroAINativeService.getOrCreateLibroAINativeForCellView(
              cell.id,
              cell,
            );
          libroAINativeForCellView.showAI = true;

          const inCode =
            l10n.getLang() === 'en-US'
              ? `Could you please optimize this piece of code?：${code}`
              : `帮忙优化一下这段代码：${code}`;
          libroAINativeForCellView.chatStream({
            content: inCode,
          });
        },
      },
    );
    this.widgetCommandRegister.registerAIWidgetCommand(
      command,
      AIWidgetCommands['Explain'],
      {
        execute: async (code, cell) => {
          if (!cell || !(cell instanceof LibroCellView)) {
            return;
          }
          const libroAINativeForCellView =
            await this.libroAINativeService.getOrCreateLibroAINativeForCellView(
              cell.id,
              cell,
            );
          libroAINativeForCellView.showAI = true;

          const inCode =
            l10n.getLang() === 'en-US'
              ? `Could you please optimize this piece of code?：${code}`
              : `帮忙解释一下这段代码：${code}`;
          libroAINativeForCellView.chatStream({
            content: inCode,
          });
        },
      },
    );
  }
}
