import type { CompletionSource, Completion } from '@codemirror/autocomplete';
import type { CompletionProvider, CompletionReply } from '@difizen/libro-code-editor';
import type { JSONObject } from '@difizen/libro-common';

type EditorCompletion = (provider: CompletionProvider | undefined) => CompletionSource;

export const kernelCompletions: EditorCompletion =
  (provider: CompletionProvider | undefined) => async (context) => {
    /**
     * 只在显式的使用tab触发时调用kernel completion
     * 只在只在隐式的输入时触发时调用lsp completion
     */
    if (!provider || !context.explicit) {
      return null;
    }
    const word = context.matchBefore(/\w*/);
    let result: CompletionReply;
    const timeout = 500;
    try {
      result = await Promise.any([
        provider({ cursorPosition: context.pos }),
        new Promise<CompletionReply>((_resolve, reject) => {
          setTimeout(() => {
            reject(`request time out in ${timeout}ms`);
          }, timeout);
        }),
      ]);
    } catch (error) {
      console.error('provider error', error);
      return null;
    }

    if (!word) {
      return null;
    }
    if (word.from === word.to) {
      return null;
    }

    const metadata = result.metadata || {};
    const types = metadata['_jupyter_types_experimental'] as JSONObject[];
    let items: Completion[];
    if (types) {
      items = types.map((item) => {
        return {
          label: item['text'] as string,
          type: item['type'] === '<unknown>' ? undefined : (item['type'] as string),
        } as Completion;
      });
    } else {
      items = result.matches.map((item) => {
        return { label: item, type: 'text' };
      });
    }

    return {
      from: result.cursor_start ?? word.from,
      to: result.cursor_end,
      options: items,
    };
  };
