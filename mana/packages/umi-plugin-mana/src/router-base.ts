import type { IApi } from 'umi';

/**
 * support dynamic router base
 * window.routerBase
 */
export default (api: IApi) => {
  api.addRuntimePlugin(() => ['../plugin-routerBase/runtime.ts']);
  api.addRuntimePluginKey(() => ['routerBase']);

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: '../plugin-routerBase/runtime.ts',
      content: `
export function modifyContextOpts(memo: any) {
  return  { ...memo, basename: window.routerBase };
};
`,
    });
  });
};
