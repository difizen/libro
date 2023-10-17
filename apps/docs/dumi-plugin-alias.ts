import type { IApi } from 'dumi';
import execa from 'execa';

export default (api: IApi) => {
  api.modifyWebpackConfig(async (memo) => {
    const { stdout } = execa.commandSync('pnpm m ls --json --depth=-1');
    try {
      const list = JSON.parse(stdout);
      list.forEach((item) => {
        if (memo.resolve?.alias) {
          memo.resolve.alias[`${item.name}/es/mock`] = `${item.path}/src/mock`;
          memo.resolve.alias[item.name] = `${item.path}/src/index.js`;
        }
      });
    } catch (_e) {
      //
    }
    return memo;
  });
};
