import {
  KernelCommands,
  LibroCommandRegister,
  LibroService,
  LibroToolbarArea,
  LibroView,
  NotebookCommands,
  LibroCellView,
  ExecutableCellView,
} from '@difizen/libro-core';
import type { CommandRegistry } from '@difizen/mana-app';
import {
  CommandContribution,
  inject,
  ModalService,
  singleton,
} from '@difizen/mana-app';

import { LibroJupyterModel } from '../libro-jupyter-model.js';
import { ExecutedWithKernelCellModel } from '../libro-jupyter-protocol.js';

@singleton({ contrib: CommandContribution })
export class LibroJupyterCommandContribution implements CommandContribution {
  @inject(ModalService) protected readonly modalService: ModalService;
  @inject(LibroCommandRegister) protected readonly libroCommand: LibroCommandRegister;
  @inject(LibroService) protected readonly libroService: LibroService;

  registerCommands(command: CommandRegistry): void {
    this.libroCommand.registerLibroCommand(
      command,
      KernelCommands['ShowKernelStatusAndSelector'],
      {
        execute: async (cell, libro) => {
          if (!libro || !(libro instanceof LibroView)) {
            return;
          }
        },
        isVisible: (cell, libro, path) => {
          if (!libro || !(libro instanceof LibroView)) {
            return false;
          }
          return (
            !libro?.model.quickEditMode &&
            !libro?.model.readOnly &&
            path === LibroToolbarArea.HeaderLeft
          );
        },
        isEnabled: (cell, libro) => {
          if (!libro || !(libro instanceof LibroView)) {
            return false;
          }
          return true;
        },
      },
    );

    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['TopToolbarRunSelect'],
      {
        execute: () => {
          //
        },
        isVisible: (cell, libro, path) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return false;
          }
          if (
            path !== LibroToolbarArea.HeaderCenter ||
            libro.model.quickEditMode ||
            libro.model.readOnly
          ) {
            return false;
          }
          return !!cell;
        },
        isEnabled: (cell, libro) => {
          if (!libro || !(libro instanceof LibroView)) {
            return false;
          }
          return (
            (libro.model as LibroJupyterModel).kernelConnection !== undefined &&
            (libro.model as LibroJupyterModel).kernelConnecting === false
          );
        },
      },
    );

    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['SideToolbarRunSelect'],
      {
        execute: () => {
          //
        },
        isVisible: (cell, libro, path) => {
          if (
            !cell ||
            !libro ||
            !ExecutableCellView.is(cell) ||
            !(libro instanceof LibroView)
          ) {
            return false;
          }
          return (
            !libro?.model.quickEditMode &&
            !libro?.model.readOnly &&
            path === LibroToolbarArea.CellRight
          );
        },
        isEnabled: (cell, libro) => {
          if (!libro || !(libro instanceof LibroView)) {
            return false;
          }
          return (
            (libro.model as LibroJupyterModel).kernelConnection !== undefined &&
            (libro.model as LibroJupyterModel).kernelConnecting === false
          );
        },
      },
    );

    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['SelectLastRunCell'],
      {
        execute: async (cell, libro) => {
          if (!libro || !(libro instanceof LibroView)) {
            return;
          }
          if (libro.model instanceof LibroJupyterModel) {
            libro.model.findRunningCell();
          }
        },
        isVisible: (cell, libro, path) => {
          if (!libro || !(libro instanceof LibroView)) {
            return false;
          }
          return (
            !libro?.model.quickEditMode &&
            path === LibroToolbarArea.HeaderCenter &&
            !libro.model.readOnly
          );
        },
        isEnabled: (cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return (
            libro.model
              .getCells()
              .findIndex(
                (item) =>
                  ExecutedWithKernelCellModel.is(item.model) &&
                  item.model.kernelExecuting,
              ) >= 0
          );
        },
      },
    );
  }
}
