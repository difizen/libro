import { CellOptions, LibroCellModel } from '@difizen/libro-jupyter';
import { inject, transient } from '@difizen/mana-app';

@transient()
export class LibroGeneralDemoCellModel extends LibroCellModel {
  lastUseTime: string;

  constructor(@inject(CellOptions) options: CellOptions) {
    super(options);
    this.lastUseTime = this.value;
  }
}
