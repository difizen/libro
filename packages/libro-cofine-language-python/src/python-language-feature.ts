/* eslint-disable global-require */

import {
  LanguageOptionsRegistry,
  SnippetSuggestContribution,
} from '@difizen/libro-cofine-editor-core';
import type { SnippetSuggestRegistry } from '@difizen/libro-cofine-editor-core';
import type {
  GrammarDefinition,
  TextmateRegistry,
} from '@difizen/libro-cofine-textmate';
import { LanguageGrammarDefinitionContribution } from '@difizen/libro-cofine-textmate';
// import { connectLanguageClient } from '@difizen/libro-cofine-editor-lsp';
// import type { LSPClientContribution, LSPClientRegistry } from '@difizen/libro-cofine-editor-lsp';
import { inject, singleton } from '@difizen/mana-app';
import * as monaco from '@difizen/monaco-editor-core';

import platformGrammar from './data/MagicPython.tmLanguage.json';
import cGrammar from './data/MagicRegExp.tmLanguage.json';
import snippetsJson from './data/snippets/python.snippets.json';
import type { BuiltinFunctions } from './python-builtin.js';
import {
  asMarkdownString,
  BuiltinFunctionList,
  BuiltinFunctionOptions,
} from './python-builtin.js';

export interface PythonLanguageOption {
  lspHost: {
    host: string;
    path: string;
  };
}

export function isPythonLanguageOption(data: object): data is PythonLanguageOption {
  return data && typeof data === 'object' && 'lspHost' in data;
}
let providerRegistered = false;
@singleton({
  contrib: [LanguageGrammarDefinitionContribution, SnippetSuggestContribution],
})
// LSPClientContribution,
export class PythonContribution
  implements LanguageGrammarDefinitionContribution, SnippetSuggestContribution
{
  protected readonly optionsResgistry: LanguageOptionsRegistry;
  constructor(
    @inject(LanguageOptionsRegistry) optionsResgistry: LanguageOptionsRegistry,
  ) {
    this.optionsResgistry = optionsResgistry;
  }
  readonly id = 'python';
  readonly config: monaco.languages.LanguageConfiguration = {
    comments: {
      lineComment: '#',
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '[', close: ']' },
      { open: '{', close: '}' },
      { open: '(', close: ')' },
      { open: "'", close: "'", notIn: ['string', 'comment'] },
      { open: '"', close: '"', notIn: ['string'] },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    folding: {
      markers: {
        start: new RegExp('^\\s*#pragma\\s+region\\b'),
        end: new RegExp('^\\s*#pragma\\s+endregion\\b'),
      },
    },
    onEnterRules: [
      {
        beforeText:
          /^\s*(?:def|class|for|if|elif|else|while|try|with|finally|except|async).*?:\s*$/,
        action: { indentAction: monaco.languages.IndentAction.Indent },
      },
    ],
  };

  registerSnippetSuggest(registry: SnippetSuggestRegistry) {
    registry.fromJSON(snippetsJson as any, {
      language: [this.id],
      source: 'Python Language',
    });
  }

  registerTextmateLanguage(registry: TextmateRegistry): void {
    monaco.languages.register({
      id: this.id,
      extensions: [
        '.py',
        '.rpy',
        '.pyw',
        '.cpy',
        '.gyp',
        '.gypi',
        '.snakefile',
        '.smk',
      ],
      aliases: ['Python', 'py'],
      firstLine: '^#!\\s*/.*\\bpython[0-9.-]*\\b',
    });
    if (!providerRegistered) {
      monaco.languages.registerCompletionItemProvider(this.id, this);
      monaco.languages.registerHoverProvider(this.id, this);
      providerRegistered = true;
    }
    monaco.languages.setLanguageConfiguration(this.id, this.config);
    registry.registerTextmateGrammarScope('source.python', {
      async getGrammarDefinition(): Promise<GrammarDefinition> {
        return {
          format: 'json',
          content: platformGrammar,
        };
      },
    });

    registry.registerTextmateGrammarScope('source.regexp.python', {
      async getGrammarDefinition(): Promise<GrammarDefinition> {
        return {
          format: 'json',
          content: cGrammar,
        };
      },
    });
    registry.mapLanguageIdToTextmateGrammar(this.id, 'source.python');
  }
  async provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
  ): Promise<monaco.languages.CompletionList | undefined> {
    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };
    if (word.word.match(/[\w]*$/)) {
      const matchedNames = BuiltinFunctionList.filter((name) =>
        name.startsWith(word.word),
      ) as BuiltinFunctions[];
      const suggestions = matchedNames.map<monaco.languages.CompletionItem>((item) => {
        return {
          label: item,
          kind: BuiltinFunctionOptions[item].completionKind,
          documentation: BuiltinFunctionOptions[item].documentation,
          detail: BuiltinFunctionOptions[item].documentation,
          insertText: item,
          range,
        };
      });
      return { suggestions };
    }

    return {
      suggestions: [],
    };
  }
  async provideHover(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
  ): Promise<monaco.languages.Hover | undefined> {
    let word = model.getWordUntilPosition(position);
    let nextWord = word;
    let currentPosition = position;
    let i = 0; // 防止死循环，设置偏移上限, 内置函数最长 11 字符
    while (i < 15 && word.word && nextWord.word.startsWith(word.word)) {
      word = nextWord;
      currentPosition = currentPosition.delta(0, 1);
      nextWord = model.getWordUntilPosition(currentPosition);
      i += 1;
    }
    if (BuiltinFunctionList.includes(word.word)) {
      const contents: monaco.IMarkdownString[] = [];
      const option = BuiltinFunctionOptions[word.word as BuiltinFunctions];
      if (option.hover) {
        contents.push(...option.hover.map((item) => asMarkdownString(item)));
      }
      if (option.documentation) {
        contents.push({
          value: option.documentation,
        });
      }
      return {
        range: new monaco.Range(
          position.lineNumber,
          word.startColumn,
          position.lineNumber,
          word.endColumn,
        ),
        contents,
      };
    }
    return undefined;
  }
}
