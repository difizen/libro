import { concatMultilineString } from '@difizen/libro-common';
import type {
  ICellMetadata,
  ExecutionCount,
  ICodeCellMetadata,
} from '@difizen/libro-common';
import type { ICodeCell } from '@difizen/libro-common';
import type { ExecutableCellModel } from '@difizen/libro-core';
import { LibroCellModel } from '@difizen/libro-core';
import { CellOptions } from '@difizen/libro-core';
import type { ExecutionMeta } from '@difizen/libro-jupyter';
import { Emitter } from '@difizen/mana-app';
import { transient } from '@difizen/mana-app';
import { prop } from '@difizen/mana-app';
import { ViewManager } from '@difizen/mana-app';
import { inject } from '@difizen/mana-app';
import type { Event as ManaEvent } from '@difizen/mana-app';

export interface PromptCellMetadata extends ICodeCellMetadata {
  execution: ExecutionMeta;
}

@transient()
export class LibroPromptCellModel
  extends LibroCellModel
  implements ExecutableCellModel
{
  @prop()
  executeCount: ExecutionCount;

  @prop()
  hasExecutedSuccess = false;
  @prop()
  hasExecutedError = false;
  @prop()
  override metadata: Partial<PromptCellMetadata | ICellMetadata>;
  @prop()
  kernelExecuting = false;

  modelType: string;
  @prop()
  executing: boolean;
  @prop()
  hasOutputHidden: boolean;
  @prop()
  hasOutputsScrolled: boolean;

  // Emitter Msg
  msgChangeEmitter: Emitter<any>;

  get msgChange(): ManaEvent<any> {
    return this.msgChangeEmitter.event;
  }

  viewManager: ViewManager;

  constructor(
    @inject(CellOptions) options: CellOptions,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    super(options);
    this.viewManager = viewManager;
    this.executing = false;
    this.msgChangeEmitter = new Emitter<any>();
    this.executeCount = (options.cell as ICodeCell).execution_count || null;
    this.hasOutputHidden = false;
    this.hasOutputsScrolled = false;
    this.mimeType = 'text/x-python';
    this.metadata = options?.cell?.metadata || {};
    this.fromSource(concatMultilineString(options?.cell?.source));
  }

  fromSource(source: string) {
    try {
      const run = source.split('%%prompt \n')[1];
      const runValue = JSON.parse(run);
      this.value = runValue.prompt;
      this.modelType = runValue.model_name;
    } catch {
      () => {
        //
      };
    }
  }

  override toJSON(): Omit<ICodeCell, 'outputs'> {
    // const outputs = this.outputArea?.toJSON() ?? this.outputs;
    const promptObj = {
      model_name: this.modelType || 'CodeGPT',
      prompt: this.value,
    };
    const encodeValue = `%%prompt \n${JSON.stringify(promptObj)}`;

    return {
      id: this.id,
      cell_type: this.type,
      source: encodeValue,
      metadata: this.metadata,
      execution_count: this.executeCount,
      // outputs: this.outputs,
    };
  }

  clearExecution(): void {
    this.executeCount = null;
    this.metadata = {};
  }

  override dispose() {
    super.dispose();
    this.msgChangeEmitter.dispose();
  }

  getSource() {
    return this.value;
  }
}
