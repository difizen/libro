import type { IApi } from 'dumi';

export default (api: IApi) => {
  api.modifyWebpackConfig(async (memo) => {
    if (memo.resolve) {
      memo.resolve.extensionAlias = {
        '.js': ['.js', '.ts', '.tsx'],
        '.jsx': ['.jsx', '.tsx'],
      };
    }
    return memo;
  });
};
