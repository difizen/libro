import type { SelectionService } from '@difizen/mana-core';

import { FileStat } from './files';
import { SelectionCommandHandler } from './selection-command-handler';

export interface FileSelection {
  fileStat: FileStat;
}
export namespace FileSelection {
  export function is(arg: Record<any, any> | undefined): arg is FileSelection {
    return (
      typeof arg === 'object' && 'fileStat' in arg && FileStat.is((arg as any).fileStat)
    );
  }
  export class CommandHandler extends SelectionCommandHandler<FileSelection> {
    protected override readonly selectionService: SelectionService;
    protected override readonly options: SelectionCommandHandler.Options<FileSelection>;

    constructor(
      selectionService: SelectionService,
      options: SelectionCommandHandler.Options<FileSelection>,
    ) {
      super(
        selectionService,
        (arg: Record<any, any> | undefined) =>
          FileSelection.is(arg) ? arg : undefined,
        options,
      );
      this.selectionService = selectionService;
      this.options = options;
    }
  }
}
