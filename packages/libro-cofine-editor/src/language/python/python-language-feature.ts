import type { SnippetSuggestRegistry } from '@difizen/libro-cofine-editor-core';
import {
  InitializeContribution,
  LanguageOptionsRegistry,
  SnippetSuggestContribution,
} from '@difizen/libro-cofine-editor-core';
import type {
  GrammarDefinition,
  TextmateRegistry,
} from '@difizen/libro-cofine-textmate';
import { LanguageGrammarDefinitionContribution } from '@difizen/libro-cofine-textmate';
import { inject, singleton } from '@difizen/libro-common/app';
import { languages } from '@difizen/monaco-editor-core';
import * as monaco from '@difizen/monaco-editor-core';

import pythonGrammar from './data/MagicPython.tmLanguage.json';
import regExpGrammar from './data/MagicRegExp.tmLanguage.json';
import snippetsJson from './data/snippets/python.snippets.json';

export interface PythonLanguageOption {
  lspHost: {
    host: string;
    path: string;
  };
}

export function isPythonLanguageOption(data: object): data is PythonLanguageOption {
  return data && typeof data === 'object' && 'lspHost' in data;
}

let langRegisted = false;
let grammerRegisted = false;

@singleton({
  contrib: [
    LanguageGrammarDefinitionContribution,
    SnippetSuggestContribution,
    InitializeContribution,
  ],
})
export class PythonContribution
  implements
    LanguageGrammarDefinitionContribution,
    SnippetSuggestContribution,
    InitializeContribution
{
  protected readonly optionsResgistry: LanguageOptionsRegistry;

  readonly id = 'python';
  readonly config: languages.LanguageConfiguration = {
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
        action: { indentAction: languages.IndentAction.Indent },
      },
    ],
  };

  constructor(
    @inject(LanguageOptionsRegistry) optionsResgistry: LanguageOptionsRegistry,
  ) {
    this.optionsResgistry = optionsResgistry;
  }

  onInitialize() {
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
    monaco.languages.onLanguage(this.id, () => {
      this.registerLanguageFeature();
    });
  }

  protected registerLanguageFeature() {
    if (langRegisted) {
      return;
    }
    langRegisted = true;
    monaco.languages.setLanguageConfiguration(this.id, this.config);
  }

  registerSnippetSuggest(registry: SnippetSuggestRegistry) {
    registry.fromJSON(snippetsJson, {
      language: [this.id],
      source: 'Python Language',
    });
  }

  registerTextmateLanguage(registry: TextmateRegistry): void {
    if (grammerRegisted) {
      return;
    }
    grammerRegisted = true;

    registry.registerTextmateGrammarScope('source.python', {
      async getGrammarDefinition(): Promise<GrammarDefinition> {
        return {
          format: 'json',
          content: pythonGrammar,
        };
      },
    });

    registry.registerTextmateGrammarScope('source.regexp.python', {
      async getGrammarDefinition(): Promise<GrammarDefinition> {
        return {
          format: 'json',
          content: regExpGrammar,
        };
      },
    });
    registry.mapLanguageIdToTextmateGrammar(this.id, 'source.python');
  }

  protected isDisposed = false;
  get disposed() {
    return this.isDisposed;
  }
  dispose() {
    this.isDisposed = false;
  }
}
