import type { LibroJupyterModel } from '@difizen/libro-jupyter';
import {
  LibroJupyterView,
  LibroService,
  NotebookCommands,
} from '@difizen/libro-jupyter';
import { TerminalCommands, TerminalManager } from '@difizen/libro-terminal';
import type { MenuRegistry } from '@difizen/mana-app';
import type { KeybindingRegistry } from '@difizen/mana-app';
import { KeybindingContribution } from '@difizen/mana-app';
import { Saveable } from '@difizen/mana-app';
import {
  CommandContribution,
  CommandRegistry,
  inject,
  MAIN_MENU_BAR,
  MenuContribution,
  singleton,
  ViewManager,
} from '@difizen/mana-app';

import { LibroLabLayoutSlots } from '../layout/index.js';
import { LayoutService } from '../layout/layout-service.js';

import { LabCommands } from './lab-command.js';

export namespace LabMenus {
  export const FILE = [...MAIN_MENU_BAR, '1_file'];
  export const EDIT = [...MAIN_MENU_BAR, '2_edit'];
  export const VIEW = [...MAIN_MENU_BAR, '3_view'];
  export const RUN = [...MAIN_MENU_BAR, '4_run'];
  export const TERMINAL = [...MAIN_MENU_BAR, '5_terminal'];
  export const HELP = [...MAIN_MENU_BAR, '6_help'];
}

@singleton({ contrib: [MenuContribution, CommandContribution, KeybindingContribution] })
export class LabMenu
  implements MenuContribution, CommandContribution, KeybindingContribution
{
  @inject(CommandRegistry) protected commandRegistry: CommandRegistry;
  @inject(LibroService) protected libroService: LibroService;
  @inject(LayoutService) protected layoutService: LayoutService;
  @inject(TerminalManager) terminalManager: TerminalManager;
  @inject(ViewManager) viewManager: ViewManager;

  registerKeybindings(keybindings: KeybindingRegistry) {
    keybindings.registerKeybinding({
      command: LabCommands.Save.id,
      keybinding: LabCommands.Save.keybind,
    });
  }

  registerMenus(menu: MenuRegistry) {
    menu.registerSubmenu(LabMenus.FILE, { label: '文件' });
    menu.registerSubmenu(LabMenus.EDIT, { label: '编辑' });
    menu.registerSubmenu(LabMenus.VIEW, { label: '视图' });
    menu.registerSubmenu(LabMenus.RUN, { label: '运行' });
    menu.registerSubmenu(LabMenus.TERMINAL, { label: '终端' });
    menu.registerSubmenu(LabMenus.HELP, { label: '帮助' });
    menu.registerMenuAction(LabMenus.TERMINAL, {
      id: TerminalCommands['OpenTerminal'].id,
      command: TerminalCommands['OpenTerminal'].id,
      label: TerminalCommands['OpenTerminal'].label,
    });
    menu.registerMenuAction(LabMenus.HELP, {
      id: LabCommands.About.id,
      command: LabCommands.About.id,
      label: LabCommands.About.label,
    });
    menu.registerMenuAction(LabMenus.FILE, {
      id: LabCommands.Save.id,
      command: LabCommands.Save.id,
      label: LabCommands.Save.label,
    });
    menu.registerMenuAction(LabMenus.FILE, {
      id: LabCommands.CreateFile.id,
      command: LabCommands.CreateFile.id,
      label: LabCommands.CreateFile.label,
    });
    menu.registerMenuAction(LabMenus.EDIT, {
      id: LabCommands.UndoCellAction.id,
      command: LabCommands.UndoCellAction.id,
      label: LabCommands.UndoCellAction.label,
    });
    menu.registerMenuAction(LabMenus.EDIT, {
      id: LabCommands.RedoCellAction.id,
      command: LabCommands.RedoCellAction.id,
      label: LabCommands.RedoCellAction.label,
    });
    menu.registerMenuAction(LabMenus.EDIT, {
      id: LabCommands.CutCell.id,
      command: LabCommands.CutCell.id,
      label: LabCommands.CutCell.label,
    });
    menu.registerMenuAction(LabMenus.EDIT, {
      id: LabCommands.CopyCell.id,
      command: LabCommands.CopyCell.id,
      label: LabCommands.CopyCell.label,
    });
    menu.registerMenuAction(LabMenus.EDIT, {
      id: LabCommands.PasteCellBelow.id,
      command: LabCommands.PasteCellBelow.id,
      label: LabCommands.PasteCellBelow.label,
    });
    menu.registerMenuAction(LabMenus.EDIT, {
      id: LabCommands.PasteCellAbove.id,
      command: LabCommands.PasteCellAbove.id,
      label: LabCommands.PasteCellAbove.label,
    });
    menu.registerMenuAction(LabMenus.EDIT, {
      id: LabCommands.PasteAndReplaceCell.id,
      command: LabCommands.PasteAndReplaceCell.id,
      label: LabCommands.PasteAndReplaceCell.label,
    });
    menu.registerMenuAction(LabMenus.EDIT, {
      id: LabCommands.DeleteCell.id,
      command: LabCommands.DeleteCell.id,
      label: LabCommands.DeleteCell.label,
    });
    menu.registerMenuAction(LabMenus.EDIT, {
      id: LabCommands.SelectAll.id,
      command: LabCommands.SelectAll.id,
      label: LabCommands.SelectAll.label,
    });
    // menu.registerMenuAction(HeaderMenus.EDIT, {
    //   id: LabCommands.DeselectAll.id,
    //   command: LabCommands.DeselectAll.id,
    //   label: LabCommands.DeselectAll.label,
    // });
    menu.registerMenuAction(LabMenus.EDIT, {
      id: LabCommands.MoveCellUp.id,
      command: LabCommands.MoveCellUp.id,
      label: LabCommands.MoveCellUp.label,
    });
    menu.registerMenuAction(LabMenus.EDIT, {
      id: LabCommands.MoveCellDown.id,
      command: LabCommands.MoveCellDown.id,
      label: LabCommands.MoveCellDown.label,
    });
    menu.registerMenuAction(LabMenus.EDIT, {
      id: LabCommands.SplitCellAntCursor.id,
      command: LabCommands.SplitCellAntCursor.id,
      label: LabCommands.SplitCellAntCursor.label,
    });
    menu.registerMenuAction(LabMenus.EDIT, {
      id: LabCommands.MergeCells.id,
      command: LabCommands.MergeCells.id,
      label: LabCommands.MergeCells.label,
    });
    menu.registerMenuAction(LabMenus.EDIT, {
      id: LabCommands.MergeCellAbove.id,
      command: LabCommands.MergeCellAbove.id,
      label: LabCommands.MergeCellAbove.label,
    });
    menu.registerMenuAction(LabMenus.EDIT, {
      id: LabCommands.MergeCellBelow.id,
      command: LabCommands.MergeCellBelow.id,
      label: LabCommands.MergeCellBelow.label,
    });
    menu.registerMenuAction(LabMenus.EDIT, {
      id: LabCommands.ClearCellOutput.id,
      command: LabCommands.ClearCellOutput.id,
      label: LabCommands.ClearCellOutput.label,
    });
    menu.registerMenuAction(LabMenus.EDIT, {
      id: LabCommands.ClearAllCellOutput.id,
      command: LabCommands.ClearAllCellOutput.id,
      label: LabCommands.ClearAllCellOutput.label,
    });
    menu.registerMenuAction(LabMenus.VIEW, {
      id: LabCommands.HideOrShowCellCode.id,
      command: LabCommands.HideOrShowCellCode.id,
      label: LabCommands.HideOrShowCellCode.label,
    });
    menu.registerMenuAction(LabMenus.VIEW, {
      id: LabCommands.HideOrShowOutputs.id,
      command: LabCommands.HideOrShowOutputs.id,
      label: LabCommands.HideOrShowOutputs.label,
    });
    menu.registerMenuAction(LabMenus.VIEW, {
      id: LabCommands.EnableOutputScrolling.id,
      command: LabCommands.EnableOutputScrolling.id,
      label: LabCommands.EnableOutputScrolling.label,
    });
    menu.registerMenuAction(LabMenus.VIEW, {
      id: LabCommands.DisableOutputScrolling.id,
      command: LabCommands.DisableOutputScrolling.id,
      label: LabCommands.DisableOutputScrolling.label,
    });
    menu.registerMenuAction(LabMenus.RUN, {
      id: LabCommands.RunCell.id,
      command: LabCommands.RunCell.id,
      label: LabCommands.RunCell.label,
    });
    menu.registerMenuAction(LabMenus.RUN, {
      id: LabCommands.RunAllAbove.id,
      command: LabCommands.RunAllAbove.id,
      label: LabCommands.RunAllAbove.label,
    });
    menu.registerMenuAction(LabMenus.RUN, {
      id: LabCommands.RunAllBelow.id,
      command: LabCommands.RunAllBelow.id,
      label: LabCommands.RunAllBelow.label,
    });
    menu.registerMenuAction(LabMenus.RUN, {
      id: LabCommands.RunAllCells.id,
      command: LabCommands.RunAllCells.id,
      label: LabCommands.RunAllCells.label,
    });
    menu.registerMenuAction(LabMenus.RUN, {
      id: LabCommands.RunCellAndSelectNext.id,
      command: LabCommands.RunCellAndSelectNext.id,
      label: LabCommands.RunCellAndSelectNext.label,
    });
    menu.registerMenuAction(LabMenus.RUN, {
      id: LabCommands.RunCellAndInsertBelow.id,
      command: LabCommands.RunCellAndInsertBelow.id,
      label: LabCommands.RunCellAndInsertBelow.label,
    });
    menu.registerMenuAction(LabMenus.RUN, {
      id: LabCommands.RestartRunAll.id,
      command: LabCommands.RestartRunAll.id,
      label: LabCommands.RestartRunAll.label,
    });
    menu.registerMenuAction(LabMenus.RUN, {
      id: LabCommands.RestartAndRunToSelected.id,
      command: LabCommands.RestartAndRunToSelected.id,
      label: LabCommands.RestartAndRunToSelected.label,
    });
  }
  registerCommands(commands: CommandRegistry) {
    // commands.registerCommand(LabCommands.OpenTerminal, {
    //   execute: () => {
    //     this.viewManager
    //       .getOrCreateView<LibroTerminalView>(LibroTerminalView, {
    //         id: v4(),
    //       })
    //       .then((terminalView) => {
    //         this.layoutService.setAreaVisible(LibroLabLayoutSlots.contentBottom, true);
    //         this.layoutService.addView(terminalView, {
    //           slot: LibroLabLayoutSlots.contentBottom,
    //           reveal: true,
    //         });
    //         return;
    //       })
    //       .catch(() => {
    //         //
    //       });
    //   },
    // });
    commands.registerCommand(LabCommands.About, {
      execute: async () => {
        //TODO: 关于
      },
    });
    commands.registerCommand(LabCommands.Save);
    commands.registerHandler(LabCommands.Save.id, {
      execute: async () => {
        const contentActive = this.layoutService.getActiveView(
          LibroLabLayoutSlots.content,
        );
        if (contentActive && Saveable.is(contentActive)) {
          contentActive.save();
        }
      },
      isEnabled: () => {
        const contentActive = this.layoutService.getActiveView(
          LibroLabLayoutSlots.content,
        );
        if (contentActive && contentActive.container?.current) {
          const contentHost = contentActive.container.current;
          if (contentHost.contains(document.activeElement)) {
            return true;
          }
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.UndoCellAction, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['UndoCellAction'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.RedoCellAction, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['RedoCellAction'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.CutCell, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['CutCell'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.CopyCell, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['CopyCell'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.DeleteCell, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['DeleteCell'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.PasteCellBelow, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['PasteCellBelow'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.PasteCellAbove, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['PasteCellAbove'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.PasteAndReplaceCell, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['PasteAndReplaceCell'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.SelectAll, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['SelectAll'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    // commands.registerCommand(LabCommands.DeselectAll, {
    //   execute: async () => {
    //     if (libro)
    //       this.commandRegistry.executeCommand(
    //         NotebookCommands.DeselectAll.id,
    //         libro.activeCell,
    //         libro,
    //       );
    //   },
    // });
    commands.registerCommandWithContext(LabCommands.MoveCellUp, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['MoveCellUp'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.MoveCellDown, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['MoveCellDown'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.SplitCellAntCursor, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['SplitCellAntCursor'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.MergeCells, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['MergeCells'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.MergeCellAbove, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['MergeCellAbove'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.MergeCellBelow, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['MergeCellBelow'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.ClearCellOutput, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['ClearCellOutput'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.ClearAllCellOutput, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['ClearAllCellOutput'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.HideOrShowCellCode, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['HideOrShowCellCode'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.HideOrShowOutputs, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['HideOrShowOutputs'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.EnableOutputScrolling, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['EnableOutputScrolling'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.DisableOutputScrolling, this, {
      execute: async () => {
        if (this.libroService.active) {
          this.commandRegistry.executeCommand(
            NotebookCommands['DisableOutputScrolling'].id,
            this.libroService.active.activeCell,
            this.libroService.active,
          );
        }
      },
      isEnabled: (ctx) => {
        const libro = ctx.libroService.active;
        if (libro && libro instanceof LibroJupyterView) {
          return true;
        }
        return false;
      },
    });
    commands.registerCommandWithContext(LabCommands.RunCell, this, {
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
    commands.registerCommandWithContext(LabCommands.RunAllAbove, this, {
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
    commands.registerCommandWithContext(LabCommands.RunAllBelow, this, {
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
    commands.registerCommandWithContext(LabCommands.RunAllCells, this, {
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
    commands.registerCommandWithContext(LabCommands.RunCellAndInsertBelow, this, {
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
    commands.registerCommandWithContext(LabCommands.RunCellAndSelectNext, this, {
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
    commands.registerCommandWithContext(LabCommands.RestartRunAll, this, {
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
    commands.registerCommandWithContext(LabCommands.RestartRunAll, this, {
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
    commands.registerCommandWithContext(LabCommands.RestartAndRunToSelected, this, {
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
