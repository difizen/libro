import type { LibroView } from '@difizen/libro-jupyter';
import { DocumentCommands, NotebookCommands } from '@difizen/libro-jupyter';
import { CommandRegistry, inject, singleton } from '@difizen/mana-app';

@singleton()
export class LibroCommandDemoService {
  @inject(CommandRegistry) commandRegistry: CommandRegistry;

  save = (libroView: LibroView | undefined) => {
    //通过命令进行保存
    this.commandRegistry.executeCommand(
      DocumentCommands['Save'].id,
      undefined,
      libroView,
      undefined,
    );
  };

  selectAll = (libroView: LibroView | undefined) => {
    //通过命令执行 cell 全选操作
    this.commandRegistry.executeCommand(
      NotebookCommands['SelectAll'].id,
      undefined,
      libroView,
      undefined,
    );
  };

  runAllCells = (libroView: LibroView | undefined) => {
    //通过命令执行 cell 全选操作
    this.commandRegistry.executeCommand(
      NotebookCommands['RunAllCells'].id,
      undefined,
      libroView,
      undefined,
    );
  };

  insertCellBelow = (libroView: LibroView | undefined) => {
    //通过命令执行 cell 全选操作
    this.commandRegistry.executeCommand(
      NotebookCommands['InsertCellBelow'].id,
      libroView?.activeCell,
      libroView,
      undefined,
    );
  };
}
