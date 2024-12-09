import type {
  WidgetActionItem,
  WidgetActionHandlerItem,
} from '@difizen/libro-code-editor';
import { EditorWidgetContribution } from '@difizen/libro-code-editor';
import { CommandRegistry } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';

import { AIWidgetCommands } from './command.js';

@singleton({ contrib: [EditorWidgetContribution] })
export class AIWidget implements EditorWidgetContribution {
  private actionsMap: Map<string, WidgetActionItem> = new Map();
  private handlerMap: Map<string, WidgetActionHandlerItem> = new Map();

  canHandle = () => {
    return 100;
  };

  @inject(CommandRegistry) protected readonly commandRegistry: CommandRegistry;

  constructor() {
    this.registerEditorInlineChat(
      {
        id: 'ai-comments',
        name: 'Comments',
        title: 'add comments（readable stream example）',
        renderType: 'button',
        codeAction: {
          isPreferred: true,
          kind: 'refactor.rewrite',
        },
      },
      {
        execute: async (code: string) => {
          this.commandRegistry.executeCommand(AIWidgetCommands['Explain'].id, code);
        },
      },
    );
    this.registerEditorInlineChat(
      {
        id: 'ai-optimize',
        name: 'Optimize',
        renderType: 'button',
        codeAction: {
          isPreferred: true,
          kind: 'refactor.rewrite',
        },
      },
      {
        execute: async (code: string) => {
          this.commandRegistry.executeCommand(AIWidgetCommands['Optimize'].id, code);
        },
      },
    );
  }
  public getAction(id: string): WidgetActionItem | undefined {
    return this.actionsMap.get(id);
  }

  public registerEditorInlineChat(
    operational: WidgetActionItem,
    handler: WidgetActionHandlerItem,
  ) {
    const isCollect = this.collectActions(operational);

    if (isCollect) {
      this.handlerMap.set(operational.id, handler);
    }
  }

  private collectActions(operational: WidgetActionItem): boolean {
    const { id } = operational;

    if (this.actionsMap.has(id)) {
      return false;
    }

    if (!operational.renderType) {
      operational.renderType = 'button';
    }

    if (!operational.order) {
      operational.order = 0;
    }

    this.actionsMap.set(id, operational);

    return true;
  }

  // show & hide
  show: () => void;
  hide: () => void;

  public getActionButtons(): WidgetActionItem[] {
    const actions = Array.from(this.handlerMap.keys())
      .filter((id) => {
        const actions_find = this.actionsMap.get(id);
        return actions_find && actions_find.renderType === 'button';
      })
      .map((id) => this.actionsMap.get(id))
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));

    return actions as WidgetActionItem[];
  }

  getActionHandler(actionId: string) {
    return this.handlerMap.get(actionId);
  }
}
