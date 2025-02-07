import type {
  ICodeCell,
  ExecutionCount,
  ICodeCellMetadata,
} from '@difizen/libro-common';
import type { ExecutableCellModel } from '@difizen/libro-core';
import { LibroCellModel } from '@difizen/libro-core';
import { CellOptions } from '@difizen/libro-core';
import type { ExecutionMeta } from '@difizen/libro-jupyter';
import { Emitter } from '@difizen/libro-common/app';
import { transient } from '@difizen/libro-common/app';
import { prop } from '@difizen/libro-common/app';
import { ViewManager } from '@difizen/libro-common/app';
import { inject } from '@difizen/libro-common/app';
import type { Event as ManaEvent } from '@difizen/libro-common/app';

import type { PromptDecodedFormatter } from './libro-formatter-prompt-magic-contribution.js';
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
  supportInterpreter?: 'dynamic' | 'immutable' | 'disable';

  @prop()
  interpreterEnabled?: boolean;

  @prop()
  interpreterCode?: string;

  @prop()
  variableName?: string;

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
      interpreterCode: this.interpreterCode,
      supportInterpreter: this.supportInterpreter,
      interpreterEnabled: this.interpreterEnabled,
    };
  }

  override set decodeObject(data: PromptDecodedFormatter) {
    this.value = data.value;
    this.prompt = data.value;
    this.variableName = data.variableName;
    this.chatKey = data.chatKey;
    this.record = data.record;
    this.interpreterCode = data.interpreterCode;
    this.supportInterpreter = data.supportInterpreter;
    this.interpreterEnabled = data.interpreterEnabled;
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
    this.metadata.interpreter = {
      ...this.metadata.interpreter,
      interpreter_code: this.interpreterCode,
      support_interpreter: this.supportInterpreter,
      interpreter_enabled: this.interpreterEnabled,
    };
    return {
      id: this.id,
      cell_type: this.type,
      source: this.source,
      metadata: this.metadata,
      execution_count: this.executeCount,
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
