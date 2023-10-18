import babelConfig from './babel.config.json';
export default {
  platform: 'browser',
  esm: {
    output: 'es',
  },
  extraBabelPlugins: babelConfig.plugins,
  extraBabelPresets: [['@babel/preset-typescript', { onlyRemoveTypeImports: true }]],
};
