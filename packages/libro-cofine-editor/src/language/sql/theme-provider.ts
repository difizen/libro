import * as monaco from '@difizen/monaco-editor-core';

import { id, keywords } from './config.js';

export const setTokensLanguage = () => {
  const conf: monaco.languages.LanguageConfiguration = {
    comments: {
      lineComment: '--',
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '`', close: '`' },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '`', close: '`' },
    ],
  };

  // tslint:disable-next-line
  const language = <monaco.languages.IMonarchLanguage>{
    defaultToken: '',
    ignoreCase: true,
    keywords,
    tokenizer: {
      root: [
        { include: '@comments' },
        { include: '@numbers' },
        { include: '@strings' },
        { include: '@operator' },
        { include: '@escapeId' },
        [
          /[\w@#$]+/,
          {
            cases: {
              '@keywords': 'keywords',
            },
          },
        ],
      ],
      // 屏蔽字段名被识别成关键词时的高亮
      escapeId: [[/[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+/, '']],
      comments: [[/--+.*/, 'comment']],
      numbers: [
        [/0[xX][0-9a-fA-F]*/, 'number'],
        [/[$][+-]*\d*(\.\d*)?/, 'number'],
        // eslint-disable-next-line no-useless-escape
        [/((\d+(\.\d*)?)|(\.\d+))([eE][\-+]?\d+)?/, 'number'],
      ],
      strings: [
        [/N'/, { token: 'string', next: '@string' }],
        [/'/, { token: 'string', next: '@string' }],
        [/N"/, { token: 'string', next: '@quotedIdentifier' }],
        [/"/, { token: 'string', next: '@quotedIdentifier' }],
        [/N`/, { token: 'string', next: '@escchart' }],
        [/`/, { token: 'string', next: '@escchart' }],
      ],
      string: [
        [/(\\.|[^'\\])+/, 'string'],
        [/''/, 'string'],
        [/'/, { token: 'string', next: '@pop' }],
      ],
      quotedIdentifier: [
        [/(\\.|[^"\\])+/, 'string'],
        [/""/, 'string'],
        [/"/, { token: 'string', next: '@pop' }],
      ],
      escchart: [
        [/(\\.|[^`\\])+/, 'string'],
        [/``/, 'string'],
        [/`/, { token: 'string', next: '@pop' }],
      ],
      operator: [[/[>|<|=|>=|<=|%|+|-|/|<>]/, 'operator']],
    },
  };

  monaco.languages.setMonarchTokensProvider(id, language);
  monaco.languages.setLanguageConfiguration(id, conf);
};
