import { Model } from '@difizen/libro-code-editor';
import type { ICell } from '@difizen/libro-common';
import { concatMultilineString } from '@difizen/libro-common';
import { DisposableCollection } from '@difizen/mana-app';
import { inject, transient } from '@difizen/mana-app';
import { prop } from '@difizen/mana-app';

import { CellOptions } from '../libro-protocol.js';
import type { CellModel } from '../libro-protocol.js';

import type { LibroCellMetadata } from './libro-cell-protocol.js';
import { getLibroCellType } from './libro-cell-protocol.js';

@transient()
export class LibroCellModel extends Model implements CellModel {
  toDispose = new DisposableCollection();

  options: CellOptions;

  @prop()
  metadata: Partial<LibroCellMetadata>;

  @prop()
  trusted: boolean;

  constructor(@inject(CellOptions) options: CellOptions) {
    super({
      id: options.cell.id as string,
      value: concatMultilineString(options?.cell?.source ?? ''),
    });
    this.options = options;
    this.type = getLibroCellType(options);
    this.metadata = options?.cell?.metadata || {};
    this.trusted = options?.cell?.metadata?.trusted ?? false;
  }

  async run() {
    return true;
  }

  toJSON(): Omit<ICell, 'outputs'> {
    return {
      id: this.id,
      cell_type: this.type,
      metadata: this.metadata,
      source: this.value,
    };
  }

  disposed = false;
  override dispose() {
    if (!this.disposed) {
      this.toDispose.dispose();
    }
    this.disposed = true;
  }
}

export function isLibroCellModel(model: CellModel): model is LibroCellModel {
  return model instanceof LibroCellModel;
}
