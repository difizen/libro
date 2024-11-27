import { MIME } from '@difizen/libro-common';
import type {
  ICodeCell,
  ExecutionCount,
  ICodeCellMetadata,
} from '@difizen/libro-common';
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

import type { InterpreterMeta } from './prompt-cell-protocol.js';

export interface PromptCellMetadata extends ICodeCellMetadata {
  execution: ExecutionMeta;
  interpreter: InterpreterMeta;
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
  override metadata: Partial<PromptCellMetadata>;
  @prop()
  kernelExecuting = false;

  @prop()
  record?: string;

  @prop()
  modelType?: string;

  @prop()
  prompt = '';

  promptOutput?: string;

  @prop()
  chatKey?: string;

  @prop()
  interpreterCode?: string;

  @prop()
  variableName: string;

  @prop()
  executing: boolean;
  @prop()
  hasOutputHidden: boolean;
  @prop()
  hasOutputsScrolled: boolean;

  _interpreterEditMode = false;

  // Emitter Msg
  msgChangeEmitter: Emitter<any>;

  get msgChange(): ManaEvent<any> {
    return this.msgChangeEmitter.event;
  }

  override get decodeObject() {
    return {
      ...this._decodeObject,
      variableName: this.variableName,
      chatKey: this.chatKey,
      record: this.record,
      value: this._interpreterEditMode ? this.prompt : this.value,
      cellId: this.id,
    };
  }

  override set decodeObject(data) {
    this.value = data.value;
    this.prompt = data.value;
    this.variableName = data.variableName;
    this.chatKey = data.chatKey;
    this.record = data.record;
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
      interpreter: {},
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
