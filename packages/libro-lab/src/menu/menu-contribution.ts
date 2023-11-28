import type { LibroJupyterModel } from '@difizen/libro-jupyter';
import {
  LibroJupyterView,
  LibroService,
  NotebookCommands,
} from '@difizen/libro-jupyter';
import type { MenuRegistry } from '@difizen/mana-app';
import {
  CommandContribution,
  CommandRegistry,
  inject,
  MAIN_MENU_BAR,
  MenuContribution,
  singleton,
} from '@difizen/mana-app';

import { MenuCommands } from './menu-command.js';

export namespace HeaderMenus {
  export const FILE = [...MAIN_MENU_BAR, '1_file'];
  export const EDIT = [...MAIN_MENU_BAR, '2_edit'];
  export const VIEW = [...MAIN_MENU_BAR, '3_view'];
  export const RUN = [...MAIN_MENU_BAR, '4_run'];
  export const TERMINAL = [...MAIN_MENU_BAR, '5_terminal'];
  export const HELP = [...MAIN_MENU_BAR, '6_help'];
}

@singleton({ contrib: [MenuContribution, CommandContribution] })
export class HeaderMenu implements MenuContribution, CommandContribution {
  @inject(CommandRegistry) protected commandRegistry: CommandRegistry;
  @inject(LibroService) protected libroService: LibroService;

  registerMenus(menu: MenuRegistry) {
    menu.registerSubmenu(HeaderMenus.FILE, { label: '文件' });
    menu.registerSubmenu(HeaderMenus.EDIT, { label: '编辑' });
    menu.registerSubmenu(HeaderMenus.VIEW, { label: '视图' });
    menu.registerSubmenu(HeaderMenus.RUN, { label: '运行' });
    menu.registerSubmenu(HeaderMenus.TERMINAL, { label: '终端' });
    menu.registerSubmenu(HeaderMenus.HELP, { label: '帮助' });
    menu.registerMenuAction(HeaderMenus.TERMINAL, {
      id: MenuCommands.OpenTerminal.id,
      command: MenuCommands.OpenTerminal.id,
      label: MenuCommands.OpenTerminal.label,
    });
    menu.registerMenuAction(HeaderMenus.HELP, {
      id: MenuCommands.About.id,
      command: MenuCommands.About.id,
      label: MenuCommands.About.label,
    });
    menu.registerMenuAction(HeaderMenus.FILE, {
      id: MenuCommands.Save.id,
      command: MenuCommands.Save.id,
      label: MenuCommands.Save.label,
    });
    menu.registerMenuAction(HeaderMenus.FILE, {
      id: MenuCommands.CreateFile.id,
      command: MenuCommands.CreateFile.id,
      label: MenuCommands.CreateFile.label,
    });
    menu.registerMenuAction(HeaderMenus.EDIT, {
      id: MenuCommands.UndoCellAction.id,
      command: MenuCommands.UndoCellAction.id,
      label: MenuCommands.UndoCellAction.label,
    });
    menu.registerMenuAction(HeaderMenus.EDIT, {
      id: MenuCommands.RedoCellAction.id,
      command: MenuCommands.RedoCellAction.id,
      label: MenuCommands.RedoCellAction.label,
    });
    menu.registerMenuAction(HeaderMenus.EDIT, {
      id: MenuCommands.CutCell.id,
      command: MenuCommands.CutCell.id,
      label: MenuCommands.CutCell.label,
    });
    menu.registerMenuAction(HeaderMenus.EDIT, {
      id: MenuCommands.CopyCell.id,
      command: MenuCommands.CopyCell.id,
      label: MenuCommands.CopyCell.label,
    });
    menu.registerMenuAction(HeaderMenus.EDIT, {
      id: MenuCommands.PasteCellBelow.id,
      command: MenuCommands.PasteCellBelow.id,
      label: MenuCommands.PasteCellBelow.label,
    });
    menu.registerMenuAction(HeaderMenus.EDIT, {
      id: MenuCommands.PasteCellAbove.id,
      command: MenuCommands.PasteCellAbove.id,
      label: MenuCommands.PasteCellAbove.label,
    });
    menu.registerMenuAction(HeaderMenus.EDIT, {
      id: MenuCommands.PasteAndReplaceCell.id,
      command: MenuCommands.PasteAndReplaceCell.id,
      label: MenuCommands.PasteAndReplaceCell.label,
    });
    menu.registerMenuAction(HeaderMenus.EDIT, {
      id: MenuCommands.DeleteCell.id,
      command: MenuCommands.DeleteCell.id,
      label: MenuCommands.DeleteCell.label,
    });
    menu.registerMenuAction(HeaderMenus.EDIT, {
      id: MenuCommands.SelectAll.id,
      command: MenuCommands.SelectAll.id,
      label: MenuCommands.SelectAll.label,
    });
    // menu.registerMenuAction(HeaderMenus.EDIT, {
    //   id: MenuCommands.DeselectAll.id,
    //   command: MenuCommands.DeselectAll.id,
    //   label: MenuCommands.DeselectAll.label,
    // });
    menu.registerMenuAction(HeaderMenus.EDIT, {
      id: MenuCommands.MoveCellUp.id,
      command: MenuCommands.MoveCellUp.id,
      label: MenuCommands.MoveCellUp.label,
    });
    menu.registerMenuAction(HeaderMenus.EDIT, {
      id: MenuCommands.MoveCellDown.id,
      command: MenuCommands.MoveCellDown.id,
      label: MenuCommands.MoveCellDown.label,
    });
    menu.registerMenuAction(HeaderMenus.EDIT, {
      id: MenuCommands.SplitCellAntCursor.id,
      command: MenuCommands.SplitCellAntCursor.id,
      label: MenuCommands.SplitCellAntCursor.label,
    });
    menu.registerMenuAction(HeaderMenus.EDIT, {
      id: MenuCommands.MergeCells.id,
      command: MenuCommands.MergeCells.id,
      label: MenuCommands.MergeCells.label,
    });
    menu.registerMenuAction(HeaderMenus.EDIT, {
      id: MenuCommands.MergeCellAbove.id,
      command: MenuCommands.MergeCellAbove.id,
      label: MenuCommands.MergeCellAbove.label,
    });
    menu.registerMenuAction(HeaderMenus.EDIT, {
      id: MenuCommands.MergeCellBelow.id,
      command: MenuCommands.MergeCellBelow.id,
      label: MenuCommands.MergeCellBelow.label,
    });
    menu.registerMenuAction(HeaderMenus.EDIT, {
      id: MenuCommands.ClearCellOutput.id,
      command: MenuCommands.ClearCellOutput.id,
      label: MenuCommands.ClearCellOutput.label,
    });
    menu.registerMenuAction(HeaderMenus.EDIT, {
      id: MenuCommands.ClearAllCellOutput.id,
      command: MenuCommands.ClearAllCellOutput.id,
      label: MenuCommands.ClearAllCellOutput.label,
    });
    menu.registerMenuAction(HeaderMenus.VIEW, {
      id: MenuCommands.HideOrShowCellCode.id,
      command: MenuCommands.HideOrShowCellCode.id,
      label: MenuCommands.HideOrShowCellCode.label,
    });
    menu.registerMenuAction(HeaderMenus.VIEW, {
      id: MenuCommands.HideOrShowOutputs.id,
      command: MenuCommands.HideOrShowOutputs.id,
      label: MenuCommands.HideOrShowOutputs.label,
    });
    menu.registerMenuAction(HeaderMenus.VIEW, {
      id: MenuCommands.EnableOutputScrolling.id,
      command: MenuCommands.EnableOutputScrolling.id,
      label: MenuCommands.EnableOutputScrolling.label,
    });
    menu.registerMenuAction(HeaderMenus.VIEW, {
      id: MenuCommands.DisableOutputScrolling.id,
      command: MenuCommands.DisableOutputScrolling.id,
      label: MenuCommands.DisableOutputScrolling.label,
    });
    menu.registerMenuAction(HeaderMenus.RUN, {
      id: MenuCommands.RunCell.id,
      command: MenuCommands.RunCell.id,
      label: MenuCommands.RunCell.label,
    });
    menu.registerMenuAction(HeaderMenus.RUN, {
      id: MenuCommands.RunAllAbove.id,
      command: MenuCommands.RunAllAbove.id,
      label: MenuCommands.RunAllAbove.label,
    });
    menu.registerMenuAction(HeaderMenus.RUN, {
      id: MenuCommands.RunAllBelow.id,
      command: MenuCommands.RunAllBelow.id,
      label: MenuCommands.RunAllBelow.label,
    });
    menu.registerMenuAction(HeaderMenus.RUN, {
      id: MenuCommands.RunAllCells.id,
      command: MenuCommands.RunAllCells.id,
      label: MenuCommands.RunAllCells.label,
    });
    menu.registerMenuAction(HeaderMenus.RUN, {
      id: MenuCommands.RunCellAndSelectNext.id,
      command: MenuCommands.RunCellAndSelectNext.id,
      label: MenuCommands.RunCellAndSelectNext.label,
    });
    menu.registerMenuAction(HeaderMenus.RUN, {
      id: MenuCommands.RunCellAndInsertBelow.id,
      command: MenuCommands.RunCellAndInsertBelow.id,
      label: MenuCommands.RunCellAndInsertBelow.label,
    });
    menu.registerMenuAction(HeaderMenus.RUN, {
      id: MenuCommands.RestartRunAll.id,
      command: MenuCommands.RestartRunAll.id,
      label: MenuCommands.RestartRunAll.label,
    });
    menu.registerMenuAction(HeaderMenus.RUN, {
      id: MenuCommands.RestartAndRunToSelected.id,
      command: MenuCommands.RestartAndRunToSelected.id,
      label: MenuCommands.RestartAndRunToSelected.label,
    });
  }
  registerCommands(commands: CommandRegistry) {
    commands.registerCommand(MenuCommands.OpenTerminal, {
      execute: () => {
        //TODO: 增加终端
      },
    });
    commands.registerCommand(MenuCommands.About, {
      execute: async () => {
        //TODO: 关于
      },
    });
    commands.registerCommand(MenuCommands.Save, {
      execute: async () => {
        //TODO: 保存
      },
    });
    commands.registerCommand(MenuCommands.UndoCellAction, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['UndoCellAction'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.RedoCellAction, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['RedoCellAction'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.CutCell, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['CutCell'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.CopyCell, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['CopyCell'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.DeleteCell, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['DeleteCell'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.PasteCellBelow, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['PasteCellBelow'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.PasteCellAbove, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['PasteCellAbove'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.PasteAndReplaceCell, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['PasteAndReplaceCell'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.SelectAll, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['SelectAll'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    // commands.registerCommand(MenuCommands.DeselectAll, {
    //   execute: async () => {
    //     if (this.libroService.active)
    //       this.commandRegistry.executeCommand(
    //         NotebookCommands.DeselectAll.id,
    //         this.libroService.active.activeCell,
    //         this.libroService.active,
    //       );
    //   },
    // });
    commands.registerCommand(MenuCommands.MoveCellUp, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['MoveCellUp'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.MoveCellDown, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['MoveCellDown'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.SplitCellAntCursor, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['SplitCellAntCursor'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.MergeCells, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['MergeCells'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.MergeCellAbove, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['MergeCellAbove'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.MergeCellBelow, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['MergeCellBelow'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.ClearCellOutput, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['ClearCellOutput'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.ClearAllCellOutput, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['ClearAllCellOutput'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.HideOrShowCellCode, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['HideOrShowCellCode'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.HideOrShowOutputs, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['HideOrShowOutputs'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.EnableOutputScrolling, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['EnableOutputScrolling'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommand(MenuCommands.DisableOutputScrolling, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['DisableOutputScrolling'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
    });
    commands.registerCommandWithContext(MenuCommands.RunCell, this, {
      execute: async (ctx) => {
        if (ctx.libroService.active) {
          ctx.commandRegistry.executeCommand(
            NotebookCommands['RunCell'].id,
            ctx.libroService.active.activeCell,
            ctx.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (!libro || !(libro instanceof LibroJupyterView)) {
          return false;
        }
        return (
          (libro.model as LibroJupyterModel).kernelConnection !== undefined &&
          (libro.model as LibroJupyterModel).kernelConnecting === false
        );
      },
    });
    commands.registerCommandWithContext(MenuCommands.RunAllAbove, this, {
      execute: async (ctx) => {
        if (ctx.libroService.active) {
          ctx.commandRegistry.executeCommand(
            NotebookCommands['RunAllAbove'].id,
            ctx.libroService.active.activeCell,
            ctx.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (!libro || !(libro instanceof LibroJupyterView)) {
          return false;
        }
        return (
          (libro.model as LibroJupyterModel).kernelConnection !== undefined &&
          (libro.model as LibroJupyterModel).kernelConnecting === false
        );
      },
    });
    commands.registerCommandWithContext(MenuCommands.RunAllBelow, this, {
      execute: async (ctx) => {
        if (ctx.libroService.active) {
          ctx.commandRegistry.executeCommand(
            NotebookCommands['RunAllBelow'].id,
            ctx.libroService.active.activeCell,
            ctx.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (!libro || !(libro instanceof LibroJupyterView)) {
          return false;
        }
        return (
          (libro.model as LibroJupyterModel).kernelConnection !== undefined &&
          (libro.model as LibroJupyterModel).kernelConnecting === false
        );
      },
    });
    commands.registerCommandWithContext(MenuCommands.RunAllCells, this, {
      execute: async (ctx) => {
        if (ctx.libroService.active) {
          ctx.commandRegistry.executeCommand(
            NotebookCommands['RunAllCells'].id,
            ctx.libroService.active.activeCell,
            ctx.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (!libro || !(libro instanceof LibroJupyterView)) {
          return false;
        }
        return (
          (libro.model as LibroJupyterModel).kernelConnection !== undefined &&
          (libro.model as LibroJupyterModel).kernelConnecting === false
        );
      },
    });
    commands.registerCommandWithContext(MenuCommands.RunCellAndInsertBelow, this, {
      execute: async (ctx) => {
        if (ctx.libroService.active) {
          ctx.commandRegistry.executeCommand(
            NotebookCommands['RunCellAndInsertBelow'].id,
            ctx.libroService.active.activeCell,
            ctx.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (!libro || !(libro instanceof LibroJupyterView)) {
          return false;
        }
        return (
          (libro.model as LibroJupyterModel).kernelConnection !== undefined &&
          (libro.model as LibroJupyterModel).kernelConnecting === false
        );
      },
    });
    commands.registerCommandWithContext(MenuCommands.RunCellAndSelectNext, this, {
      execute: async (ctx) => {
        if (ctx.libroService.active) {
          ctx.commandRegistry.executeCommand(
            NotebookCommands['RunCellAndSelectNext'].id,
            ctx.libroService.active.activeCell,
            ctx.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (!libro || !(libro instanceof LibroJupyterView)) {
          return false;
        }
        return (
          (libro.model as LibroJupyterModel).kernelConnection !== undefined &&
          (libro.model as LibroJupyterModel).kernelConnecting === false
        );
      },
    });
    commands.registerCommandWithContext(MenuCommands.RestartRunAll, this, {
      execute: async (ctx) => {
        if (ctx.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['RestartRunAll'].id,
            ctx.libroService.active.activeCell,
            ctx.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (!libro || !(libro instanceof LibroJupyterView)) {
          return false;
        }
        return (
          (libro.model as LibroJupyterModel).kernelConnection !== undefined &&
          (libro.model as LibroJupyterModel).kernelConnecting === false
        );
      },
    });
    commands.registerCommandWithContext(MenuCommands.RestartRunAll, this, {
      execute: async (ctx) => {
        if (ctx.libroService.active) {
          ctx.commandRegistry.executeCommand(
            NotebookCommands['RestartRunAll'].id,
            ctx.libroService.active.activeCell,
            ctx.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (!libro || !(libro instanceof LibroJupyterView)) {
          return false;
        }
        return (
          (libro.model as LibroJupyterModel).kernelConnection !== undefined &&
          (libro.model as LibroJupyterModel).kernelConnecting === false
        );
      },
    });
    commands.registerCommandWithContext(MenuCommands.RestartAndRunToSelected, this, {
      execute: async (ctx) => {
        if (ctx.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['RestartAndRunToSelected'].id,
            ctx.libroService.active.activeCell,
            ctx.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (!libro || !(libro instanceof LibroJupyterView)) {
          return false;
        }
        return (
          (libro.model as LibroJupyterModel).kernelConnection !== undefined &&
          (libro.model as LibroJupyterModel).kernelConnecting === false
        );
      },
    });
  }
}
