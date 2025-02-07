import { defineConfig } from 'dumi';
import path from 'path';

export default defineConfig({
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'opensumi-module-libro',
  },
  theme: {
    '@s-content-width': '100%', //https://github.com/umijs/dumi/blob/31fd13cd8cbf52a1ac00275078e3b93934c3d1cf/src/client/theme-default/styles/variables.less#L3
  },
  alias: {
    modules: path.resolve(__dirname, 'modules'),
  },
  extraBabelPlugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-transform-flow-strip-types', { allowDeclareFields: true }],
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
    'babel-plugin-parameter-decorator',
  ],
  mfsu: false,
  define: {
    'process.env.WORKSPACE_DIR': path.join(process.cwd(), 'example'),
    'process.env.EXTENSION_DIR': path.join(process.cwd(), 'extensions'),
  },
});
