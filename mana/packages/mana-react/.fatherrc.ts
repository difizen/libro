export default {
  platform: 'browser',
  esm: {
    output: 'es',
  },
  cjs: {
    output: 'lib',
  },
  extraBabelPlugins: [],
  extraBabelPresets: [
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
      },
    ],
    ['@babel/preset-typescript', { onlyRemoveTypeImports: true }],
  ],
};
