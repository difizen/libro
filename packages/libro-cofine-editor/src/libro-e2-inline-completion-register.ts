import { InlineCompletionManager } from '@difizen/libro-code-editor';
import { ApplicationContribution } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';
import * as monaco from '@difizen/monaco-editor-core';

@singleton({ contrib: [ApplicationContribution] })
export class LibroE2InlineCompletionRegister implements ApplicationContribution {
  inlineCompletionManager: InlineCompletionManager;

  constructor(
    @inject(InlineCompletionManager) inlineCompletionManager: InlineCompletionManager,
  ) {
    this.inlineCompletionManager = inlineCompletionManager;
  }

  onViewStart() {
    this.inlineCompletionManager.getCompletionImplements.map((item) => {
      monaco.languages.registerInlineCompletionsProvider(item.selector, {
        provideInlineCompletions: async (model, position, context, token) => {
          const startRange = new monaco.Range(
            0,
            0,
            position.lineNumber,
            position.column,
          );
          let prefix = model.getValueInRange(startRange);
          if (prefix === '') {
            prefix += '\n';
          }
          const endRange = new monaco.Range(
            position.lineNumber,
            position.column,
            model.getLineCount(),
            Number.MAX_SAFE_INTEGER,
          );

          const suffix = model.getValueInRange(endRange);

          const languageId = model.getLanguageId();
          const newContext = {
            fileUrl: model.uri.fsPath,
            filename: model.uri.toString().split('/').pop() || '',
            language: languageId,
            prefix,
            suffix,
            position: {
              line: position.lineNumber,
              column: position.column,
            },
          };

          const res: any = await item.getInlineCompletions(newContext, token);

          return res;
        },
        freeInlineCompletions: item.freeInlineCompletions,
      });
    });
  }
}
