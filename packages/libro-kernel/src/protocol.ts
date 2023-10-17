import type { NotebookModel } from '@difizen/libro-core';

import type { IContentsModel } from './contents/index.js';
import type { IKernelConnection } from './kernel/index.js';

export const ExecutableNotebookModel = {
  is: (arg: Record<any, any> | undefined): arg is ExecutableNotebookModel => {
    return (
      !!arg &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'filePath' in arg &&
      typeof (arg as any).filePath === 'string' &&
      'currentFileContents' in arg &&
      typeof (arg as any).currentFileContents === 'object'
    );
  },
};

export interface ExecutableNotebookModel extends NotebookModel {
  filePath: string;
  currentFileContents: IContentsModel;
  kernelConnection?: IKernelConnection;
  kcReady: Promise<IKernelConnection>;
}
