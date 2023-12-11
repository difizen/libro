import { LibroCodeCellModel } from '@difizen/libro-code-cell';
import type { ICellMetadata } from '@difizen/libro-common';
import { CellOptions } from '@difizen/libro-core';
import { inject, transient } from '@difizen/mana-app';
import { prop, ViewManager } from '@difizen/mana-app';

import type {
  CodeCellMetadata,
  ExecutedWithKernelCellModel,
} from '../libro-jupyter-protocol.js';

@transient()
export class JupyterCodeCellModel
  extends LibroCodeCellModel
  implements ExecutedWithKernelCellModel
{
  @prop()
  override metadata: Partial<CodeCellMetadata | ICellMetadata>;
  @prop()
  kernelExecuting = false;

  constructor(
    @inject(CellOptions) options: CellOptions,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    super(options, viewManager);
    this.metadata = {
      ...options?.cell?.metadata,
      libroFormatter: this.libroFormatType,
    };
  }

  override clearExecution = () => {
    this.executeCount = null;
    this.kernelExecuting = false;
    this.metadata.execution = {};
  };
}
