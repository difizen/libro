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
