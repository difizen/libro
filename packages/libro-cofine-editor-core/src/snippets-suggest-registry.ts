import type { Contribution } from '@difizen/libro-common/app';
import { contrib, singleton, Syringe } from '@difizen/libro-common/app';
import * as monaco from '@difizen/monaco-editor-core';

import { InitializeContribution } from './initialize-provider.js';

export interface SnippetLoadOptions {
  language?: string | string[];
  source: string;
}

export type JsonSerializedSnippets = Record<string, JsonSerializedSnippet>;
export interface JsonSerializedSnippet {
  body: string[];
  scope: string;
  prefix: string;
  description: string;
}

export interface SnippetSuggestContribution {
  registerSnippetSuggest: (registry: SnippetSuggestRegistry) => void;
  _initRegisterSnippetSuggest?: boolean;
}

export const SnippetSuggestContribution = Syringe.defineToken(
  'SnippetSuggestContribution',
);

@singleton({ contrib: InitializeContribution })
export class SnippetSuggestRegistry implements InitializeContribution {
  registerCompletion = false;
  awaysInitialized = true;
  onInitialize() {
    this.snippetsSuggestContrbutions
      .getContributions({ cache: false })
      .forEach((contribution) => {
        if (contribution._initRegisterSnippetSuggest) {
          return;
        }
        contribution.registerSnippetSuggest(this);
        contribution._initRegisterSnippetSuggest = true;
      });
  }
  protected languageSnippets: Record<string, JsonSerializedSnippet[]> = {};

  snippetsSuggestContrbutions: Contribution.Provider<SnippetSuggestContribution>;
  constructor(
    @contrib(SnippetSuggestContribution)
    snippetsSuggestContrbutions: Contribution.Provider<SnippetSuggestContribution>,
  ) {
    this.snippetsSuggestContrbutions = snippetsSuggestContrbutions;
  }

  async provideCompletionItems(
    model: monaco.editor.ITextModel,
  ): Promise<monaco.languages.CompletionList | undefined> {
    const _language = model.getLanguageId();
    const _snippets: JsonSerializedSnippet[] = this.languageSnippets[_language] || [];
    const suggestions = _snippets.map((it) => {
      return {
        label: it.prefix,
        insertText: it.body.join('\n'),
        documentation: it.description,
        detail: 'snippet',
        insertTextRules: 4,
        kind: 27,
        range: undefined as unknown as monaco.IRange,
      };
    });
    return { suggestions };
  }

  fromJSON(
    snippets: JsonSerializedSnippets | undefined,
    { language }: SnippetLoadOptions,
  ) {
    if (!language || !language?.length || !snippets) {
      return;
    }
    const _languages = typeof language === 'string' ? [language] : language;
    _languages.forEach((it) => {
      if (!this.languageSnippets[it]) {
        this.languageSnippets[it] = [];
      }
      this.languageSnippets[it].push(
        ...(Object.values(snippets) as JsonSerializedSnippet[]),
      );
    });
    // 采集数据
    if (this.registerCompletion) {
      return;
    }
    this.registerCompletion = true;
    monaco.languages.registerCompletionItemProvider(
      { pattern: '**' },
      {
        provideCompletionItems: this.provideCompletionItems.bind(this),
      },
    );
  }
}
