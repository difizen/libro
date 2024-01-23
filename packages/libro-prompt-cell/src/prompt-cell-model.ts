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

  @prop()
  record: string;

  @prop()
  modelType: string;

  @prop()
  variableName: string;

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

  override get decodeObject() {
    return {
      ...this._decodeObject,
      variableName: this.variableName,
      modelType: this.modelType,
      record: this.record,
      value: this.value,
      cellId: this.id,
    };
  }

  override set decodeObject(value) {
    super.decodeObject = value;
    this.variableName = value.variableName;
    this.modelType = value.modelType;
    this.record = value.record;
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
    this.libroFormatType = 'formatter-prompt-magic';
    this.mimeType = 'application/vnd.libro.prompt+json';
    this.metadata = {
      ...options?.cell?.metadata,
      libroFormatter: this.libroFormatType,
    };
  }

  override toJSON(): Omit<ICodeCell, 'outputs'> {
    return {
      id: this.id,
      cell_type: this.type,
      source: this.source,
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
