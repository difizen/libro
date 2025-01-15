module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:promise/recommended',
    'prettier',
  ],
  plugins: ['import'],

  env: {
    node: true,
  },
  settings: {
    react: {
      version: '18',
    },
  },

  rules: {
    // common pitfalls
    eqeqeq: 'error',
    curly: 'error',

    // stricter type correctness
    'no-unused-vars': [
      'warn',
      {
        vars: 'local',
        args: 'none',
        destructuredArrayIgnorePattern: '^_',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        caughtErrors: 'none',
      },
    ],
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
    '@typescript-eslint/no-shadow': [
      'warn',
      {
        ignoreTypeValueShadow: true,
      },
    ],

    // react rules
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',

    // no sloppiness
    'no-console': ['error', { allow: ['error', 'warn', 'info'] }],

    // import rules and fixes
    '@typescript-eslint/consistent-type-imports': 'error',
    'import/newline-after-import': 'warn',
    'import/order': [
      'warn',
      {
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before',
          },
        ],
        distinctGroup: false,
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },

  overrides: [
    {
      files: ['*.js', '*.cjs', '*.mjs', '*.jsx'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
