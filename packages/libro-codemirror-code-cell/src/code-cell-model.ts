import type { ICodeCell } from '@difizen/libro-common';
import type { ExecutionCount } from '@difizen/libro-common';
import { LibroCellModel, CellOptions } from '@difizen/libro-core';
import type { ExecutableCellModel } from '@difizen/libro-core';
import type { Event as ManaEvent } from '@difizen/mana-app';
import { Emitter } from '@difizen/mana-app';
import { prop, ViewManager, inject, transient } from '@difizen/mana-app';

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
    this.mimeType = 'text/x-python';
    this.hasOutputHidden = false;
    this.hasOutputsScrolled = false;
    this.viewManager = viewManager;
  }

  override toJSON(): Omit<ICodeCell, 'outputs'> {
    // const outputs = this.outputArea?.toJSON() ?? this.outputs;
    return {
      id: this.id,
      cell_type: this.type,
      source: this.value,
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
