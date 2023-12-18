/* eslint-disable @typescript-eslint/no-namespace */

import type monaco from '@difizen/monaco-editor-core';
import type { IGrammar, StateStack } from 'vscode-textmate';
import { INITIAL } from 'vscode-textmate';

/**
 * Options for the TextMate tokenizer.
 */
export interface TokenizerOption {
  /**
   * Maximum line length that will be handled by the TextMate tokenizer. If the length of the actual line exceeds this
   * limit, the tokenizer terminates and the tokenization of any subsequent lines might be broken.
   *
   * If the `lineLimit` is not defined, it means, there are no line length limits. Otherwise, it must be a positive
   * integer or an error will be thrown.
   */
  lineLimit?: number;
}

export namespace TokenizerOption {
  /**
   * The default TextMate tokenizer option.
   *
   * @deprecated Use the current value of `editor.maxTokenizationLineLength` preference instead.
   */
  export const DEFAULT: TokenizerOption = {
    lineLimit: 400,
  };
}

export function createTextmateTokenizer(
  grammar: IGrammar,
  options: TokenizerOption,
): monaco.languages.EncodedTokensProvider {
  if (
    options.lineLimit !== undefined &&
    (options.lineLimit <= 0 || !Number.isInteger(options.lineLimit))
  ) {
    throw new Error(
      `The 'lineLimit' must be a positive integer. It was ${options.lineLimit}.`,
    );
  }
  return {
    getInitialState: () => INITIAL,
    tokenizeEncoded(
      line: string,
      state: monaco.languages.IState,
    ): monaco.languages.IEncodedLineTokens {
      const tokenizeLineResult2 = grammar.tokenizeLine2(line, state as StateStack);
      const { tokens, ruleStack: endState } = tokenizeLineResult2;
      return { tokens, endState };
    },
  };
}
