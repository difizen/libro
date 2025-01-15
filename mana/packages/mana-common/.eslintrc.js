module.exports = {
  root: true,
  extends: [require.resolve('../../.eslintrc.js')],
  rules: {
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-redeclare': 'off',
  },
};
