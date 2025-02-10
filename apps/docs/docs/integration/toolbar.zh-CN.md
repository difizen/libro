---
title: 自定义工具栏
order: 2
---

# 工具栏

libro 的工具栏（Toolbar）是整个 libro UI 界面中重要的一部分，它包含了一系列的按钮，帮助用户快速访问常用功能，目前在 libro 中默认显示在编辑器的顶部和选中 cell 的右侧。
<img
    src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/toolbar_zh.png"
    width="800"
/>

### 如何往工具栏中注册自定义工具按钮？

在 libro 中，每个模块都可以向工具注册表中添加工具按钮。最基础的工具按钮通常包含这几个部分：

- id: 工具按钮的唯一标识符。
- command: 工具按钮绑定的命令 id。
- tooltip: 可选，鼠标悬停在按钮上时显示的提示文本，用于向用户提供关于按钮功能的简要说明。
- icon: 可选,按钮的图标显示。
- order：可选，该属性决定了工具栏按钮的显示顺序。数值越小的按钮将显示在前面，越大的按钮显示在后面。如果不设置，libro 将按默认顺序显示按钮。
- group：可选，工具栏中的按钮可以通过该属性进行分组，确保相关功能的按钮在视觉上靠近。

其中，工具栏的按钮与命令紧密关联。每个按钮都会绑定到一个命令，用户点击工具栏按钮时，会触发绑定命令的执行。

#### 注册工具栏按钮

1. libro 使用依赖注入机制来管理工具栏按钮的注册，因此你需要创建一个工具栏按钮扩展类，并在这个类中注册工具栏按钮。工具栏扩展类实现了 ToolbarContribution 接口，这个接口提供了 registerToolbarItems 方法，专门用于注册工具栏按钮。
2. 工具按钮继承来自命令的 icon、label 属性，以及 execute、isVisible、isEnabled 等逻辑控制函数，保证相同的命令在工具栏、菜单等多处可见时的统一，工具栏按钮也可以在注册时自定义 icon、label 等属性。

- 更具体的， 在 libro 中，工具栏按钮对应的命令采用 LibroCommandRegister 的方式注册，以保证 execute、isVisible、isEnabled 等逻辑控制函数中可以拿到 CellView 实例、LibroView 实例、path。工具栏按钮的位置选项如下，通过 isVisible 函数中的 path 参数控制位置显示。

| 位置变量标识                  | 具体位置        |
| :---------------------------- | :-------------- |
| LibroToolbarArea.HeaderLeft   | 顶部左侧工具栏  |
| LibroToolbarArea.HeaderCenter | 顶部中间工具栏  |
| LibroToolbarArea.HeaderRight  | 顶部右侧工具栏  |
| LibroToolbarArea.CellTop      | cell 顶部工具栏 |
| LibroToolbarArea.CellRight    | cell 右侧工具栏 |

3. 把新增的命令扩展类注册进 mana module 中。

```typescript
import { AppExtention } from '@difizen/libro-jupyter';
import { LibroEditorModule } from '../libro-editor/module';
import { LibroDemoToolbarContribution } from './libro-demo-toolbar-contribution';

const { ManaModule } = AppExtention;
export const LibroToolbarDemoModule = ManaModule.create()
  .register(LibroDemoToolbarContribution)
  .dependOn(LibroEditorModule);
```

##### 示例

```typescript
import {
  LibroCommandRegister,
  LibroToolbarArea,
  AppExtention,
  AppIOC,
} from '@difizen/libro-jupyter';
import {
  BellOutlined,
  BulbOutlined,
  HeartOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { LibroDemoToolbarCommand } from './libro-demo-toolbar-commands';

const { CommandContribution, CommandRegistry, ToolbarContribution, ToolbarRegistry } =
  AppExtention;
const { inject, singleton } = AppIOC;
@singleton({ contrib: [ToolbarContribution, CommandContribution] })
export class LibroDemoToolbarContribution
  implements AppExtention.ToolbarContribution, AppExtention.CommandContribution
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
```
