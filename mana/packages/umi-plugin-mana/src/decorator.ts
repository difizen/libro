import type { IApi } from 'umi';

/**
 * support decorator, using for typescript 4
 */
export default (api: IApi) => {
  api.addExtraBabelPlugins(() => {
    return [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-transform-flow-strip-types', { allowDeclareFields: true }],
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      'babel-plugin-parameter-decorator',
    ];
  });
};
