import type { InlineCompletionRegistry } from '@difizen/libro-code-editor';
import { InlineCompletionContribution } from '@difizen/libro-code-editor';
import { Sequencer } from '@difizen/libro-code-editor';
import { inject, singleton } from '@difizen/mana-app';

import { AICompletionProvider } from './inline-completion-provider.js';

@singleton({ contrib: [InlineCompletionContribution] })
export class AICompletionContribution implements InlineCompletionContribution {
  private sequencer = new Sequencer();
  completionProvider: AICompletionProvider;

  constructor(@inject(AICompletionProvider) completionProvider: AICompletionProvider) {
    this.completionProvider = completionProvider;
  }

  canHandle() {
    return 100;
  }

  registerCompletion(register: InlineCompletionRegistry) {
    register.addCompletion({
      selector: '*',
      getInlineCompletions: async (context, token) => {
        const completionsResult = await this.sequencer.queue(() =>
          this.completionProvider.provideInlineCompletionItems(context, token),
        );

        return completionsResult;
      },
      freeInlineCompletions: () => {
        return;
      },
    });
  }
}
