import type { IRawCell } from '@difizen/libro-common';
import { CellOptions, LibroCellModel } from '@difizen/libro-core';
import { inject, transient } from '@difizen/libro-common/mana-app';

@transient()
export class LibroRawCellModel extends LibroCellModel {
  constructor(@inject(CellOptions) options: CellOptions) {
    super(options);
    this.mimeType = 'text/plain';
  }

  override toJSON(): IRawCell {
    return {
      id: this.id,
      cell_type: 'raw',
      source: this.source,
      metadata: this.metadata,
    };
  }

  override dispose() {
    super.dispose();
  }

  getSource() {
    return this.value;
  }
}
