/* eslint-disable no-console */
import {
  BellOutlined,
  BulbOutlined,
  HeartOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { LibroCommandRegister, LibroToolbarArea } from '@difizen/libro-jupyter';
import type { CommandRegistry, ToolbarRegistry } from '@difizen/mana-app';
import {
  CommandContribution,
  inject,
  singleton,
  ToolbarContribution,
} from '@difizen/mana-app';

import { LibroDemoToolbarCommand } from './libro-demo-toolbar-commands';

@singleton({ contrib: [ToolbarContribution, CommandContribution] })
export class LibroDemoToolbarContribution
  implements ToolbarContribution, CommandContribution
{
  @inject(LibroCommandRegister) protected readonly libroCommand: LibroCommandRegister;

  registerCommands(command: CommandRegistry): void {
    this.libroCommand.registerLibroCommand(
      command,
      LibroDemoToolbarCommand['demoToolbarCommand1'],
      {
        execute: async (cell, libro, path) => {
          console.log('工具栏按钮注册在顶部中间工具栏示例');
        },
        isEnabled: () => {
          return true;
        },
        isVisible: (cell, libro, path) => {
          return path === LibroToolbarArea.HeaderCenter;
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      LibroDemoToolbarCommand['demoToolbarCommand2'],
      {
        execute: async (cell, libro, path) => {
          console.log('工具栏按钮注册在顶部右侧工具栏和 cell 右侧工具栏示例');
        },
        isEnabled: () => {
          return true;
        },
        isVisible: (cell, libro, path) => {
          return (
            path === LibroToolbarArea.HeaderCenter ||
            path === LibroToolbarArea.CellRight
          );
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      LibroDemoToolbarCommand['demoToolbarCommand3'],
      {
        execute: async (cell, libro, path) => {
          console.log('工具栏按钮注册在顶部右侧工具栏和 cell 右侧工具栏,并且成组示例');
        },
        isEnabled: () => {
          return true;
        },
        isVisible: (cell, libro, path) => {
          return (
            path === LibroToolbarArea.HeaderRight || path === LibroToolbarArea.CellRight
          );
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      LibroDemoToolbarCommand['demoToolbarCommand4'],
      {
        execute: async (cell, libro, path) => {
          console.log('工具栏按钮注册在顶部右侧工具栏和 cell 右侧工具栏，并且成组示例');
        },
        isEnabled: () => {
          return true;
        },
        isVisible: (cell, libro, path) => {
          return (
            path === LibroToolbarArea.HeaderRight || path === LibroToolbarArea.CellRight
          );
        },
      },
    );
  }

  registerToolbarItems(registry: ToolbarRegistry): void {
    registry.registerItem({
      id: LibroDemoToolbarCommand['demoToolbarCommand1'].id,
      command: LibroDemoToolbarCommand['demoToolbarCommand1'].id,
      icon: BulbOutlined,
      tooltip: LibroDemoToolbarCommand['demoToolbarCommand1'].label,
    });
    registry.registerItem({
      id: LibroDemoToolbarCommand['demoToolbarCommand2'].id,
      command: LibroDemoToolbarCommand['demoToolbarCommand2'].id,
      icon: BellOutlined,
      tooltip: LibroDemoToolbarCommand['demoToolbarCommand2'].label,
    });
    registry.registerItem({
      id: LibroDemoToolbarCommand['demoToolbarCommand3'].id,
      command: LibroDemoToolbarCommand['demoToolbarCommand3'].id,
      icon: HeartOutlined,
      tooltip: LibroDemoToolbarCommand['demoToolbarCommand3'].label,
      order: '1',
      group: ['groupdemo'],
    });
    registry.registerItem({
      id: LibroDemoToolbarCommand['demoToolbarCommand4'].id,
      command: LibroDemoToolbarCommand['demoToolbarCommand4'].id,
      icon: MoonOutlined,
      tooltip: LibroDemoToolbarCommand['demoToolbarCommand4'].label,
      order: '2',
      group: ['groupdemo'],
    });
  }
}
