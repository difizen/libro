import * as monaco from '@difizen/monaco-editor-core';

export const setTokensLanguage = () => {
  monaco.languages.setMonarchTokensProvider('julia', {
    tokenizer: {
      root: [
        [/#.*$/, 'comment'], // 单行注释
        [/(#=)/, 'comment', '@comment'],

        // 字符串：普通和多行
        [/r"([^"\\]|\\.)*"/, 'string'], // raw 字符串
        [/"""(?:[^"\\]|\\.)*"""/, 'string'], // 三重双引号字符串
        [/"([^"\\]|\\.)*$/, 'string.invalid'], // 非闭合的字符串
        [/"/, { token: 'string.quote', bracket: '@open', next: '@stringDouble' }],
        [/'[^\\']'/, 'string'], // 单字符

        // 关键字
        [
          /\b(?:function|end|if|else|elseif|for|while|return|break|continue|struct|mutable|abstract|primitive|type|quote|let|do|try|catch|finally|macro|module|import|export|using|const|global|local|in|isa)\b/,
          'keyword',
        ],

        // 常量
        [/\b(?:true|false|nothing|NaN|Inf)\b/, 'constant'],

        // 数字：包括整数、浮点数、复数
        [
          /-?(\d+(\.\d+)?([eE][+-]?\d+)?|0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+)(im)?/,
          'number',
        ],

        // 运算符
        [/(::|->|=>|==|!=|<=|>=|&&|\|\||[+\-*/^$@~?<>!=÷∈≤≥∉⊆⊇∪∩∖∈⊂⊃±∓])/, 'operator'],

        // 宏
        [/@\w+/, 'keyword.other'],

        // 类型
        [
          /\b(?:Int8|Int16|Int32|Int64|UInt8|UInt16|UInt32|UInt64|Float16|Float32|Float64|Bool|Char|String|Array|Dict|Tuple|Set|Vector|Matrix)\b/,
          'type',
        ],

        // 标识符
        [/\p{L}[\w]*\b/u, 'identifier'], // 支持 Unicode 字符

        // 特殊函数
        [
          /\b(?:println|print|Int|Float64|String|Vector|Array|Dict|Set|push!|pop!|length|typeof|size|rand|zeros|ones|sqrt|log|exp|sin|cos|tan|abs|min|max|sum|prod|findall|findfirst)\b/,
          'predefined',
        ],
      ],

      stringDouble: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
      ],

      comment: [
        [/#=/, 'comment', '@push'],
        [/=#/, 'comment', '@pop'],
        [/[^=#]+/, 'comment'],
      ],
    },
  });
};
