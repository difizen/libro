import type {
  ICellMetadata,
  ICodeCellMetadata,
  PartialJSONObject,
  INotebookContent,
} from '@difizen/libro-common';
import { ExecutableCellModel } from '@difizen/libro-core';
import type { IContentsModel } from '@difizen/libro-kernel';
import type { Event as ManaEvent, Emitter } from '@difizen/mana-app';

export interface ExecutionMeta extends PartialJSONObject {
  'shell.execute_reply.started': string; // Kernel 开始执行任务时间在 metadata 中的 key
  'shell.execute_reply.end': string; // Kernel 结束执行任务时间在 metadata 中的 key
  to_execute: string; // 用户点击执行任务在 metadata 中的 key
}

export interface CodeCellMetadata extends ICodeCellMetadata {
  execution: ExecutionMeta;
}

export type ExecutedWithKernelCellMeta = Partial<CodeCellMetadata | ICellMetadata>;

export interface ExecutedWithKernelCellModel extends ExecutableCellModel {
  metadata: ExecutedWithKernelCellMeta;
  kernelExecuting: boolean;
}

export const ExecutedWithKernelCellModel = {
  is: (arg: Record<any, any> | undefined): arg is ExecutedWithKernelCellModel => {
    return (
      ExecutableCellModel.is(arg) &&
      'kernelExecuting' in arg &&
      typeof (arg as any).kernelExecuting === 'boolean'
    );
  },
};

export type KernelStatusAndSelectorProvider = React.FC;
export const KernelStatusAndSelectorProvider = Symbol(
  'KernelStatusAndSelectorProvider',
);

export const LibroFileService = Symbol('LibroFileService');
export interface LibroFileService {
  fileSaveError: ManaEvent<Partial<IContentsModel>>;
  fileSaveErrorEmitter: Emitter<
    Partial<IContentsModel> & { msg?: string; cause?: string }
  >;
  read: (path: string) => Promise<IContentsModel | undefined>;
  write: (
    notebookContent: INotebookContent,
    currentFileContents: IContentsModel,
  ) => Promise<IContentsModel | undefined>;
}
