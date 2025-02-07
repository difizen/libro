import type { CellOptions } from '@difizen/libro-core';
import type { CommandRegistry } from '@difizen/libro-common/app';
import { CommandContribution, singleton } from '@difizen/libro-common/app';

export const LibroAddBetweenCellCommand = {
  AddBetweenCell: {
    id: 'notebook:libro-add-between-cell',
  },
  AddBetweenCellWithContext: {
    id: 'notebook:libro-add-between-cell-with-context',
  },
};

@singleton({ contrib: CommandContribution })
export class LibroAddBetweenCellCommandContribution implements CommandContribution {
  registerCommands(command: CommandRegistry): void {
    command.registerCommand(LibroAddBetweenCellCommand.AddBetweenCell, {
      execute: async (
        type: string,
        addCell: (option: CellOptions, position?: number | undefined) => Promise<void>,
        index: number,
      ) => {
        if (!type || typeof addCell !== 'function') {
          return;
        }
        await addCell(
          {
            cell: {
              cell_type: type,
              metadata: {},
              source: '',
            },
          },
          index,
        );
      },
    });

    command.registerCommand(LibroAddBetweenCellCommand.AddBetweenCellWithContext, {
      execute: async (
        type: string,
        addCell: (option: CellOptions, position?: number | undefined) => Promise<void>,
        index: number,
        context: Record<string, any>,
      ) => {
        if (!type || typeof addCell !== 'function') {
          return;
        }
        await addCell(
          {
            cell: {
              cell_type: type,
              metadata: {},
              source: '',
            },
            context: context,
          },
          index,
        );
      },
    });
  }
}
