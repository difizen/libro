import * as monaco from '@difizen/monaco-editor-core';

export const setTokensLanguage = () => {
  monaco.languages.setMonarchTokensProvider('r', {
    tokenizer: {
      root: [
        // 单行注释
        [/#.*$/, 'comment'],

        // 字符串处理：双引号和单引号
        [/"([^"\\]|\\.)*$/, 'string.invalid'], // 非闭合的字符串
        [/"/, { token: 'string.quote', bracket: '@open', next: '@stringDouble' }],
        [/'([^'\\]|\\.)*$/, 'string.invalid'], // 非闭合的字符串
        [/'/, { token: 'string.quote', bracket: '@open', next: '@stringSingle' }],

        // 关键字
        [/\b(?:if|else|repeat|while|function|for|in|next|break|return)\b/, 'keyword'],

        // 常量
        [/\b(?:TRUE|FALSE|NULL|NA|NaN|Inf)\b/, 'constant'],

        // 数字：整数、浮点数、科学计数法
        [/-?\d+(\.\d+)?([eE][+-]?\d+)?/, 'number'],

        // 操作符
        [/<-|<<-|->|->>|\+\+|--|&&|\|\||[+\-*/^$@]/, 'operator'],

        // 特殊函数
        [
          /\b(?:library|require|source|print|cat|paste|str|summary|plot|hist|mean|sd|var|lm|read\.csv|write\.csv|data\.frame|matrix|list|c)\b/,
          'predefined',
        ],

        // 标识符
        [/[a-zA-Z_]\w*/, 'identifier'],
      ],

      // 双引号字符串
      stringDouble: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
      ],

      // 单引号字符串
      stringSingle: [
        [/[^\\']+/, 'string'],
        [/\\./, 'string.escape'],
        [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
      ],
    },
  });
};
