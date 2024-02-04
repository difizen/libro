import { MIME } from '@difizen/libro-common';
import type { ICodeCell, ExecutionCount } from '@difizen/libro-common';
import type { ExecutableCellModel } from '@difizen/libro-core';
import { CellOptions, LibroCellModel } from '@difizen/libro-core';
import type { Event as ManaEvent } from '@difizen/mana-app';
import { inject, prop, transient, ViewManager } from '@difizen/mana-app';
import { Emitter } from '@difizen/mana-app';

/**
 * 基础的可执行代码的cell, 带有执行能力
 */
@transient()
export class LibroCodeCellModel extends LibroCellModel implements ExecutableCellModel {
  @prop()
  executeCount: ExecutionCount;
  @prop()
  executing: boolean;
  @prop()
  hasOutputHidden: boolean;
  @prop()
  hasOutputsScrolled: boolean;

  declare libroFormatType: string;

  viewManager: ViewManager;

  // Emitter Msg
  msgChangeEmitter: Emitter<any>;

  get msgChange(): ManaEvent<any> {
    return this.msgChangeEmitter.event;
  }

  constructor(
    @inject(CellOptions) options: CellOptions,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    super(options);
    this.executing = false;
    this.msgChangeEmitter = new Emitter<any>();
    this.executeCount = (options.cell as ICodeCell).execution_count || null;
    this.mimeType = MIME.python;
    this.hasOutputHidden = false;
    this.hasOutputsScrolled = false;
    this.viewManager = viewManager;
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

  clearExecution = () => {
    this.executeCount = null;
    this.executing = false;
  };

  override dispose() {
    super.dispose();
    this.msgChangeEmitter.dispose();
  }

  getSource() {
    return this.value;
  }
}
