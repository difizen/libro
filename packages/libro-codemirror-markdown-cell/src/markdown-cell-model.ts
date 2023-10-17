import type { IMarkdownCell } from '@difizen/libro-common';
import { concatMultilineString } from '@difizen/libro-common';
import type { LibroMarkdownCellModel } from '@difizen/libro-core';
import { LibroCellModel, CellOptions } from '@difizen/libro-core';
import { prop } from '@difizen/mana-app';
import { inject, transient } from '@difizen/mana-app';

@transient()
export class MarkdownCellModel
  extends LibroCellModel
  implements LibroMarkdownCellModel
{
  @prop()
  override mimeType = 'text/x-markdown';

  constructor(@inject(CellOptions) options: CellOptions) {
    super(options);
    if (options.cell?.id) {
      this.id = options.cell?.id as string;
    }
    if (options.cell?.source) {
      this.value = concatMultilineString(options.cell?.source);
    }
  }

  @prop()
  isEdit = false;

  @prop()
  override value = '';

  @prop()
  preview = '';

  override toJSON(): IMarkdownCell {
    return {
      id: this.id,
      cell_type: 'markdown',
      source: this.value,
      metadata: this.metadata,
    };
  }
}
