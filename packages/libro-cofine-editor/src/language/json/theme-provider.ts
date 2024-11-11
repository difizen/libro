import * as monaco from '@difizen/monaco-editor-core';

export const setTokensLanguage = () => {
  monaco.languages.setMonarchTokensProvider('json', {
    tokenizer: {
      root: [
        // 匹配括号
        [/\{/, 'delimiter.bracket', '@push'],
        [/\}/, 'delimiter.bracket', '@pop'],
        [/\[/, 'delimiter.square', '@push'],
        [/\]/, 'delimiter.square', '@pop'],
        // 匹配键名（字符串）或简单字符串值
        [/"([^"\\]|\\.)*$/, 'string.invalid'], // 非闭合的字符串
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
        // 匹配逗号和冒号分隔符
        [/[,:]/, 'delimiter'],
        // 布尔值和 null
        [/\b(?:true|false|null)\b/, 'constant.language'],
        // 数字，包括整数和浮点数
        [/-?\d+(\.\d+)?([eE][-+]?\d+)?/, 'number'],
        // 错误字符
        [/[^{}[\],:"\s]+/, 'invalid'],
      ],
      // 字符串处理
      string: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
      ],
    },

    // 定义转义字符
    escapes: /\\["\\/bfnrt]|\\u[0-9A-Fa-f]{4}/,
  });
};
