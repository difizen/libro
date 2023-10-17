import type { CommandRegistry } from '@difizen/mana-app';
import {
  inject,
  ModalService,
  singleton,
  CommandContribution,
} from '@difizen/mana-app';
import { equals } from '@difizen/mana-app';
import { v4 } from 'uuid';

import { LibroCellView, ExecutableCellModel } from '../cell/index.js';
import type { LibroEditorCellView } from '../cell/index.js';
import { LirboContextKey } from '../libro-context-key.js';
import type { CellView, NotebookView } from '../libro-protocol.js';
import { LibroToolbarArea } from '../libro-protocol.js';
import { LibroService } from '../libro-service.js';
import { LibroView } from '../libro-view.js';
import { RestartClearOutputModal } from '../toolbar/restart-clear-outputs-modal.js';
import { ShutdownModal } from '../toolbar/shutdown-modal.js';

import { DocumentCommands } from './document-commands.js';
import { LibroCommandRegister } from './libro-command-register.js';
import { NotebookCommands } from './notebook-commands.js';

@singleton({ contrib: CommandContribution })
export class LibroCommandContribution implements CommandContribution {
  protected readonly modalService: ModalService;
  protected readonly libroCommand: LibroCommandRegister;
  protected readonly libroService: LibroService;
  protected readonly lirboContextKey: LirboContextKey;

  constructor(
    @inject(ModalService) modalService: ModalService,
    @inject(LibroCommandRegister) libroCommand: LibroCommandRegister,
    @inject(LibroService) libroService: LibroService,
    @inject(LirboContextKey) lirboContextKey: LirboContextKey,
  ) {
    this.libroCommand = libroCommand;
    this.modalService = modalService;
    this.libroService = libroService;
    this.lirboContextKey = lirboContextKey;
  }

  registerCommands(command: CommandRegistry): void {
    this.libroCommand.registerLibroCommand(command, NotebookCommands['EnterEditMode'], {
      execute: async () => {
        this.libroService.active?.enterEditMode();
      },
      isEnabled: (_cell, libro) => {
        if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
          return false;
        }
        return true;
      },
    });
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['EnterCommandMode'],
      {
        execute: () => {
          this.libroService.active?.enterCommandMode(true);
        },
      },
    );
    this.libroCommand.registerLibroCommand(command, NotebookCommands['SelectAll'], {
      execute: (cell, libro) => {
        if (
          !cell ||
          !libro ||
          !(cell instanceof LibroCellView) ||
          !(libro instanceof LibroView)
        ) {
          return;
        }
        libro.selectAllCell();
      },
    });
    this.libroCommand.registerLibroCommand(command, NotebookCommands['RunCell'], {
      execute: async (cell, libro) => {
        if (
          !cell ||
          !libro ||
          !(cell instanceof LibroCellView) ||
          !(libro instanceof LibroView)
        ) {
          return;
        }
        libro.runCell(cell);
      },
      isEnabled: (_cell, libro) => {
        if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
          return false;
        }
        return true;
      },
    });
    this.libroCommand.registerLibroCommand(command, NotebookCommands['RunAllCells'], {
      execute: async (_cell, libro) => {
        if (!libro || !(libro instanceof LibroView)) {
          return;
        }
        libro.runAllCell();
      },
    });
    this.libroCommand.registerLibroCommand(command, NotebookCommands['RunAllAbove'], {
      execute: async (cell, libro) => {
        if (
          !cell ||
          !libro ||
          !(cell instanceof LibroCellView) ||
          !(libro instanceof LibroView)
        ) {
          return;
        }
        libro.runAllAbove(cell);
      },
    });
    this.libroCommand.registerLibroCommand(command, NotebookCommands['RunAllBelow'], {
      execute: async (cell, libro) => {
        if (
          !cell ||
          !libro ||
          !(cell instanceof LibroCellView) ||
          !(libro instanceof LibroView)
        ) {
          return;
        }
        libro.runAllBelow(cell);
      },
    });
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['RunCellAndSelectNext'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.runCellandSelectNext(cell);
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return true;
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['RunCellAndInsertBelow'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.runCellandInsertBelow(cell);
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return true;
        },
      },
    );
    this.libroCommand.registerLibroCommand(command, NotebookCommands['Interrupt'], {
      execute: async (_cell, libro) => {
        if (!libro || !(libro instanceof LibroView)) {
          return false;
        }
        if (libro.model.interrupt) {
          libro.model.interrupt();
        }
        return;
      },
      isEnabled: (_cell, libro) => {
        if (!libro || !(libro instanceof LibroView)) {
          return false;
        }
        return (
          libro.model
            .getCells()
            .findIndex(
              (item) => ExecutableCellModel.is(item.model) && item.model.executing,
            ) >= 0
        );
      },
      isVisible: (_cell, libro, path) => {
        if (!libro || !(libro instanceof LibroView)) {
          return false;
        }
        return (
          !libro?.model.quickEditMode &&
          !libro?.model.readOnly &&
          path === LibroToolbarArea.HeaderCenter
        );
      },
    });
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['RestartClearOutput'],
      {
        execute: async (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView)) {
            return false;
          }
          this.modalService.openModal(RestartClearOutputModal, libro);
          return;
        },
        isVisible: (_cell, libro, path) => {
          if (!libro || !(libro instanceof LibroView)) {
            return false;
          }
          return (
            !libro?.model.quickEditMode &&
            !libro?.model.readOnly &&
            path === LibroToolbarArea.HeaderCenter
          );
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['CloseAndShutdown'],
      {
        execute: async (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView)) {
            return false;
          }
          this.modalService.openModal(ShutdownModal, libro);
          return;
        },
        isVisible: () => false,
        // isVisible: (cell, libro, path) => {
        //   if (!libro || !(libro instanceof LibroView)) return false;
        //   if (path !== LibroToolbarArea.HeaderCenter || libro.model.quickEditMode) return false;
        //   return true;
        // },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['InsertCellBelow'],
      {
        execute: async (cell, libro) => {
          if (!libro || !(libro instanceof LibroView)) {
            return;
          }
          if (!cell || !(cell instanceof LibroCellView)) {
            libro.addCell(
              { id: v4(), cell: { cell_type: 'code', source: '', metadata: {} } },
              0,
            );
          } else {
            const cellIndex = libro.model.cells.findIndex((item) => equals(item, cell));
            libro.addCell(
              {
                id: v4(),
                cell: { cell_type: cell.model.type, source: '', metadata: {} },
              },
              cellIndex + 1,
            );
          }
        },
        // isVisible: () => false,
        isVisible: (_cell, libro, path) => {
          if (!libro || !(libro instanceof LibroView)) {
            return false;
          }
          return !libro?.model.readOnly && path === LibroToolbarArea.CellRight;
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return true;
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['InsertCellAbove'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          const cellIndex = libro.model.cells.findIndex((item) => equals(item, cell));
          if (cellIndex > -1) {
            libro.addCellAbove(
              {
                id: v4(),
                cell: { cell_type: cell.model.type, source: '', metadata: {} },
              },
              cellIndex,
            );
          }
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return true;
        },
      },
    );

    command.registerCommand(NotebookCommands['InsertCellBottom'], {
      execute: async (libro, targetType) => {
        if (!libro || !(libro instanceof LibroView)) {
          return;
        }
        const nextIndex = libro.model.cells.length;
        libro.addCell(
          {
            cell: {
              cell_type: targetType,
              metadata: {},
              source: '',
            },
          },
          nextIndex,
        );
      },
    });

    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['MoveCursorDown'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.moveCursorDown(cell);
        },
      },
    );
    this.libroCommand.registerLibroCommand(command, NotebookCommands['MoveCursorUp'], {
      execute: async (cell, libro) => {
        if (
          !cell ||
          !libro ||
          !(cell instanceof LibroCellView) ||
          !(libro instanceof LibroView)
        ) {
          return;
        }
        libro.moveCursorUp(cell);
      },
    });
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['MergeCellBelow'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.mergeCellBelow(cell);
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return true;
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['MergeCellAbove'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.mergeCellAbove(cell);
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return true;
        },
      },
    );
    this.libroCommand.registerLibroCommand(command, NotebookCommands['MergeCells'], {
      execute: async (cell, libro) => {
        if (
          !cell ||
          !libro ||
          !(cell instanceof LibroCellView) ||
          !(libro instanceof LibroView)
        ) {
          return;
        }
        libro.mergeCells(cell);
      },
      isEnabled: (_cell, libro) => {
        if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
          return false;
        }
        return true;
      },
    });
    this.libroCommand.registerLibroCommand(command, NotebookCommands['DeleteCell'], {
      execute: async (cell, libro) => {
        if (
          !cell ||
          !libro ||
          !(cell instanceof LibroCellView) ||
          !(libro instanceof LibroView)
        ) {
          return;
        }
        libro.deleteCell(cell);
      },
      isVisible: (_cell, libro, path) => {
        if (!libro || !(libro instanceof LibroView)) {
          return false;
        }
        return !libro?.model.readOnly && path === LibroToolbarArea.CellRight;
      },
      isEnabled: (_cell, libro) => {
        if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
          return false;
        }
        return true;
      },
    });
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['ClearCellOutput'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.clearOutputs(cell);
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return true;
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['ClearAllCellOutput'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.clearAllOutputs();
        },
        isVisible: (_cell, libro, path) => {
          if (!libro || !(libro instanceof LibroView)) {
            return false;
          }
          return !libro?.model.readOnly && path === LibroToolbarArea.HeaderCenter;
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return true;
        },
      },
    );
    this.libroCommand.registerLibroCommand(command, NotebookCommands['MoveCellUp'], {
      execute: async (cell, libro) => {
        if (
          !cell ||
          !libro ||
          !(cell instanceof LibroCellView) ||
          !(libro instanceof LibroView)
        ) {
          return;
        }
        libro.moveUpCell(cell);
      },
      isVisible: (_cell, _libro, path) => {
        return path === LibroToolbarArea.CellRight;
      },
      isEnabled: (cell, libro) => {
        if (
          !cell ||
          !libro ||
          !(cell instanceof LibroCellView) ||
          !(libro instanceof LibroView) ||
          libro.model.readOnly
        ) {
          return false;
        }
        const cellIndex = libro.model
          .getCells()
          .findIndex((item) => equals(item, cell));
        return cellIndex > 0;
      },
    });
    this.libroCommand.registerLibroCommand(command, NotebookCommands['MoveCellDown'], {
      execute: async (cell, libro) => {
        if (
          !cell ||
          !libro ||
          !(cell instanceof LibroCellView) ||
          !(libro instanceof LibroView)
        ) {
          return;
        }
        libro.moveDownCell(cell);
      },
      isEnabled: (cell, libro) => {
        if (
          !cell ||
          !libro ||
          !(cell instanceof LibroCellView) ||
          !(libro instanceof LibroView) ||
          libro.model.readOnly
        ) {
          return false;
        }
        const cellIndex = libro.model
          .getCells()
          .findIndex((item) => equals(item, cell));
        return cellIndex !== libro.model.getCells().length - 1;
      },
      isVisible: (_cell, _libro, path) => {
        return path === LibroToolbarArea.CellRight;
      },
    });
    this.libroCommand.registerLibroCommand(command, NotebookCommands['CopyCell'], {
      execute: async (cell, libro) => {
        if (
          !cell ||
          !libro ||
          !(cell instanceof LibroCellView) ||
          !(libro instanceof LibroView)
        ) {
          return;
        }
        libro.copyCell(cell);
      },
      isVisible: () => false,
      // isVisible: (cell, libro, path) => {
      //   if (
      //     ![LibroToolbarArea.CellRight, LibroToolbarArea.HeaderCenter].find(item => item === path)
      //   ) {
      //     return false;
      //   }
      //   return true;
      // },
      isEnabled: (_cell, libro) => {
        if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
          return false;
        }
        return true;
      },
    });
    this.libroCommand.registerLibroCommand(command, NotebookCommands['CutCell'], {
      execute: async (cell, libro) => {
        if (
          !cell ||
          !libro ||
          !(cell instanceof LibroCellView) ||
          !(libro instanceof LibroView)
        ) {
          return;
        }
        libro.cutCell(cell);
      },
      isVisible: () => false,
      // isVisible: (cell, libro, path) => {
      //   if (
      //     ![LibroToolbarArea.CellRight, LibroToolbarArea.HeaderCenter].find(item => item === path)
      //   ) {
      //     return false;
      //   }
      //   return true;
      // },
      isEnabled: (_cell, libro) => {
        if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
          return false;
        }
        return true;
      },
    });
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['PasteCellAbove'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.pasteCellAbove(cell);
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return true;
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['PasteCellBelow'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.pasteCell(cell);
        },
        isVisible: () => false,
        // isVisible: (cell, libro, path) => {
        //   if (
        //     ![LibroToolbarArea.CellRight, LibroToolbarArea.HeaderCenter].find(item => item === path)
        //   ) {
        //     return false;
        //   }
        //   return true;
        // },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return !!libro.model.lastClipboardInteraction;
        },
      },
    );
    this.libroCommand.registerLibroCommand(command, NotebookCommands['HideCellCode'], {
      execute: async (cell, libro) => {
        if (
          !cell ||
          !libro ||
          !(cell instanceof LibroCellView) ||
          !(libro instanceof LibroView)
        ) {
          return;
        }
        libro.hideCellCode(cell);
      },
      isVisible: (_cell, _libro, path) => {
        if (path === LibroToolbarArea.HeaderCenter) {
          return true;
        }
        return false;
      },
    });
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['HideOrShowCellCode'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.hideOrShowCellCode(cell);
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['HideCellOutputs'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.hideOutputs(cell);
        },
        isVisible: (cell, _libro, path) => {
          if (
            cell &&
            cell instanceof LibroCellView &&
            ExecutableCellModel.is(cell.model) &&
            path === LibroToolbarArea.CellRight
          ) {
            return true;
          }
          return false;
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['HideOrShowOutputs'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.hideOrShowOutputs(cell);
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['HideAllCellCode'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.hideAllCellCode();
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['HideAllCellOutput'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.hideAllOutputs();
        },
      },
    );
    this.libroCommand.registerLibroCommand(command, NotebookCommands['HideAllCell'], {
      execute: () => {
        //
      },
      isVisible: (_cell, libro, path) => {
        if (!libro || !(libro instanceof LibroView)) {
          return false;
        }
        return !libro?.model.readOnly && path === LibroToolbarArea.HeaderCenter;
      },
      isEnabled: (_cell, libro) => {
        if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
          return false;
        }
        return true;
      },
    });
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['ShowCellOutputs'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.showCellOutputs(cell);
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['ShowAllCellOutputs'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.showAllCellOutputs();
        },
      },
    );
    this.libroCommand.registerLibroCommand(command, NotebookCommands['ShowCellCode'], {
      execute: async (cell, libro) => {
        if (
          !cell ||
          !libro ||
          !(cell instanceof LibroCellView) ||
          !(libro instanceof LibroView)
        ) {
          return;
        }
        libro.showCellCode(cell);
      },
    });
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['ShowAllCellCode'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.showAllCellCode();
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['ExtendMarkedCellsAbove'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.extendSelectionAbove();
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['ExtendMarkedCellsTop'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.extendSelectionToTop();
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['ExtendMarkedCellsBelow'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.extendSelectionBelow();
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['ExtendMarkedCellsBottom'],
      {
        execute: async (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.extendSelectionToBottom();
        },
      },
    );
    command.registerCommand(NotebookCommands['ChangeCellTo'], {
      execute: async (cell, libro, _path, targetType) => {
        if (
          !cell ||
          !libro ||
          !(cell instanceof LibroCellView) ||
          !(libro instanceof LibroView)
        ) {
          return;
        }

        if (targetType) {
          libro.invertCell(cell, targetType);
        }
      },
      isVisible: (_cell, libro, path) => {
        if (!libro || !(libro instanceof LibroView)) {
          return false;
        }
        return !libro?.model.readOnly && path === LibroToolbarArea.HeaderCenter;
      },
      isEnabled: (_cell, libro) => {
        if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
          return false;
        }
        return true;
      },
    });
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['ChangeCellToCode'],
      {
        execute: (cell: CellView | undefined, libro: NotebookView | undefined) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.invertCell(cell, 'code');
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return true;
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['ChangeCellToMarkdown'],
      {
        execute: (cell: CellView | undefined, libro: NotebookView | undefined) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.invertCell(cell, 'markdown');
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return true;
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['EnableOutputScrolling'],
      {
        execute: (cell: CellView | undefined, libro: NotebookView | undefined) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.enableOutputScrolling(cell);
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['DisableOutputScrolling'],
      {
        execute: (cell: CellView | undefined, libro: NotebookView | undefined) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.disableOutputScrolling(cell);
        },
      },
    );
    this.libroCommand.registerLibroCommand(command, DocumentCommands['Save'], {
      execute: async (_cell, libro) => {
        if (!libro || !(libro instanceof LibroView)) {
          return;
        }
        libro.save();
      },
      isVisible: (_cell, libro, path) => {
        if (!libro || !(libro instanceof LibroView)) {
          return false;
        }
        return !libro?.model.readOnly && path === LibroToolbarArea.HeaderCenter;
      },
      isEnabled: (_cell, libro) => {
        if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
          return false;
        }
        return true;
      },
    });
    // this.libroCommand.registerLibroCommand(command, DocumentCommands['OpenSettings'], {
    //   execute: async () => {
    //     this.modalService.openModal(SettingsModal);
    //   },
    //   isVisible: (cell, libro, path) => {
    //     return path === LibroToolbarArea.HeaderCenter;
    //   },
    // });
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['UndoCellAction'],
      {
        execute: async (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView)) {
            return;
          }

          libro.model.undo();
        },
        isVisible: (_cell, libro, path) => {
          if (!libro || !(libro instanceof LibroView)) {
            return false;
          }
          return !libro?.model.readOnly && path === LibroToolbarArea.HeaderCenter;
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }

          return libro.model.canUndo ?? false;
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['RedoCellAction'],
      {
        execute: async (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView)) {
            return;
          }
          libro.model.redo();
        },
        isVisible: (_cell, libro, path) => {
          if (!libro || !(libro instanceof LibroView)) {
            return false;
          }
          return !libro?.model.readOnly && path === LibroToolbarArea.HeaderCenter;
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return libro.model.canRedo ?? false;
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['SplitCellAntCursor'],
      {
        execute: (cell: CellView | undefined, libro: NotebookView | undefined) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.splitCell(cell);
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return true;
        },
      },
    );
    this.libroCommand.registerLibroCommand(command, NotebookCommands['Redo'], {
      execute: async (cell) => {
        if (!cell || !(cell instanceof LibroCellView)) {
          return;
        }
        (cell as LibroEditorCellView).redo();
      },
      isEnabled: (_cell, libro) => {
        if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
          return false;
        }
        return true;
      },
    });
    this.libroCommand.registerLibroCommand(command, NotebookCommands['Undo'], {
      execute: async (cell) => {
        if (!cell || !(cell instanceof LibroCellView)) {
          return;
        }
        (cell as LibroEditorCellView).undo();
      },
      isEnabled: (_cell, libro) => {
        if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
          return false;
        }
        return true;
      },
    });
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['ChangeCellToHeading1'],
      {
        execute: (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.setMarkdownHeader(cell, 1);
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return true;
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['ChangeCellToHeading2'],
      {
        execute: (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.setMarkdownHeader(cell, 2);
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return true;
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['ChangeCellToHeading3'],
      {
        execute: (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.setMarkdownHeader(cell, 3);
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return true;
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['ChangeCellToHeading4'],
      {
        execute: (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.setMarkdownHeader(cell, 4);
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return true;
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['ChangeCellToHeading5'],
      {
        execute: (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.setMarkdownHeader(cell, 5);
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return true;
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      NotebookCommands['ChangeCellToHeading6'],
      {
        execute: (cell, libro) => {
          if (
            !cell ||
            !libro ||
            !(cell instanceof LibroCellView) ||
            !(libro instanceof LibroView)
          ) {
            return;
          }
          libro.setMarkdownHeader(cell, 6);
        },
        isEnabled: (_cell, libro) => {
          if (!libro || !(libro instanceof LibroView) || libro.model.readOnly) {
            return false;
          }
          return true;
        },
      },
    );

    this.libroCommand.registerLibroCommand(command, NotebookCommands['More'], {
      execute: async (_cell, libro) => {
        if (!libro || !(libro instanceof LibroView)) {
          return;
        }
      },
      isVisible: (_cell, _libro, path) => {
        return path === LibroToolbarArea.CellRight;
      },
    });
  }
}
