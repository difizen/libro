import { singleton } from '@difizen/mana-app';
import * as monaco from '@difizen/monaco-editor-core';

import type {
  IIntelligentCompletionProvider,
  IIntelligentCompletionsRegistry,
} from './inline-completions-protocol.js';
import { Sequencer } from './sequencer.js';

@singleton()
export class InlineCompletionRegistry implements IIntelligentCompletionsRegistry {
  private inlineCompletionsProvider: IIntelligentCompletionProvider | undefined;

  private sequencer = new Sequencer();

  hasInitialize = false;

  registerInlineCompletionsProvider(provider: IIntelligentCompletionProvider): void {
    this.inlineCompletionsProvider = provider;
  }

  initialize() {
    // 只允许初始化一次
    if (this.hasInitialize) {
      return;
    }

    if (!this.inlineCompletionsProvider) {
      console.error(
        'InlineCompletionRegistry Error: inlineCompletionsProvider is not registered',
      );
      return;
    }
    const inlineCompletionsProvider = this.inlineCompletionsProvider;
    monaco.languages.registerInlineCompletionsProvider('*', {
      provideInlineCompletions: async (model, position, context, token) => {
        const completionsResult = await this.sequencer.queue(() =>
          inlineCompletionsProvider.provideInlineCompletionItems(
            model,
            position,
            context,
            token,
          ),
        );
        return completionsResult;
      },
      freeInlineCompletions() {
        return;
      },
    });
    this.hasInitialize = true;
  }
}
