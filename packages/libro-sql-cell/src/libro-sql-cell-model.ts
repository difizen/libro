import type {
  ICellMetadata,
  ICodeCell,
  ICodeCellMetadata,
} from '@difizen/libro-common';
import type { ExecutionCount } from '@difizen/libro-common';
import { CellOptions, LibroCellModel } from '@difizen/libro-jupyter';
import type { ExecutableCellModel } from '@difizen/libro-jupyter';
import type { Event as ManaEvent } from '@difizen/libro-common/mana-app';
import {
  Emitter,
  inject,
  prop,
  transient,
  ViewManager,
} from '@difizen/libro-common/mana-app';

import type { SqlDecodedFormatter } from './libro-formatter-sql-magic-contribution.js';

export interface SqlCellMetadata extends ICodeCellMetadata {
  resultVariable: string;
}
@transient()
export class LibroSqlCellModel extends LibroCellModel implements ExecutableCellModel {
  @prop()
  resultVariable: string | undefined;
  @prop()
  dbId: string | undefined;
  @prop()
  executeCount: ExecutionCount;
  @prop()
  executing: boolean;
  @prop()
  hasOutputHidden: boolean;
  @prop()
  hasOutputsScrolled: boolean;

  @prop()
  kernelExecuting = false;

  @prop()
  hasExecutedSuccess = false;
  @prop()
  hasExecutedError = false;
  @prop()
  override metadata: Partial<SqlCellMetadata | ICellMetadata>;

  declare _decodeObject: SqlDecodedFormatter;

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
    this.mimeType = 'application/vnd.libro.sql+json';
    this.hasOutputHidden = false;
    this.hasOutputsScrolled = false;
    this.libroFormatType = 'formatter-sql-magic';
    this.metadata = {
      ...options?.cell?.metadata,
      libroFormatter: this.libroFormatType,
    };
  }

  override toJSON(): Omit<ICodeCell, 'outputs'> {
    // const outputs = this.outputArea?.toJSON() ?? this.outputs;
    return {
      id: this.id,
      cell_type: this.type,
      source: this.source,
      metadata: this.metadata,
      execution_count: this.executeCount,
      // outputs: this.outputs,
    };
  }

  override set decodeObject(data: SqlDecodedFormatter) {
    this.value = data.value;
    this.resultVariable = data.result_variable;
    this.dbId = data.db_id;
    this._decodeObject = data;
  }

  override get decodeObject() {
    return {
      ...this._decodeObject,
      value: this.value,
      result_variable: this.resultVariable || this._decodeObject.result_variable,
      db_id: this.dbId || this._decodeObject.db_id,
    };
  }

  clearExecution = () => {
    this.executeCount = null;
    this.executing = false;
    this.kernelExecuting = false;
    this.metadata['execution'] = {};
  };

  override dispose() {
    super.dispose();
    this.msgChangeEmitter.dispose();
  }

  getSource() {
    return this.value;
  }
}
