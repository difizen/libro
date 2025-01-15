import type { IApi } from 'umi';

/**
 * support nodenext, import module via file path with extname
 */
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
