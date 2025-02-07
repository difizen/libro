import type { ExecutionCount } from '@difizen/libro-common';
import type { Emitter } from '@difizen/libro-common/mana-app';

export interface ExecutableCellModel {
  // 执行中
  executing: boolean;

  // 执行次数
  executeCount: ExecutionCount;

  hasOutputHidden: boolean;

  hasOutputsScrolled: boolean;

  // Emitter Msg
  msgChangeEmitter: Emitter<any>;

  clearExecution: () => void;
}

export const ExecutableCellModel = {
  is: (arg: Record<any, any> | undefined): arg is ExecutableCellModel => {
    return (
      !!arg &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'executing' in arg &&
      typeof (arg as any).executing === 'boolean' &&
      'executeCount' in arg &&
      (typeof (arg as any).executeCount === 'number' || !(arg as any).executeCount)
    );
  },
};
