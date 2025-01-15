import { IApi } from 'umi';

export default (api: IApi) => {
  // Runtime Plugin
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
