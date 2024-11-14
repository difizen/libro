---
title: Custom Toolbar
order: 2
---

# Toolbar

The toolbar in Libro is an important part of the entire Libro UI interface, containing a series of buttons that help users quickly access commonly used features. By default, it is displayed at the top of the editor and to the right of the selected cell.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/toolbar.png" width="800" />

### How to Register Custom Toolbar Buttons?

In Libro, each module can add tool buttons to the tool registration table. The basic components of a tool button typically include:

- **id**: A unique identifier for the tool button.
- **command**: The command ID that the tool button is bound to.
- **tooltip**: Optional; the hint text displayed when the mouse hovers over the button, providing a brief description of the button's function.
- **icon**: Optional; the icon displayed on the button.
- **order**: Optional; this property determines the display order of the toolbar buttons. Buttons with smaller values will appear first, while larger values will appear later. If not set, Libro will display the buttons in the default order.
- **group**: Optional; this property can group buttons in the toolbar to ensure that related function buttons are visually close together.

The toolbar buttons are closely linked with commands. Each button is bound to a command, and when the user clicks the toolbar button, it triggers the execution of the bound command.

#### Registering Toolbar Buttons

1. Libro uses a dependency injection mechanism to manage the registration of toolbar buttons. Therefore, you need to create a toolbar button extension class and register the toolbar buttons within this class. The toolbar extension class implements the `ToolbarContribution` interface, which provides the `registerToolbarItems` method specifically for registering toolbar buttons.
2. The tool buttons inherit properties from the command such as `icon`, `label`, as well as logic control functions like `execute`, `isVisible`, and `isEnabled`, ensuring consistency when the same command is visible in the toolbar, menu, and other places. The toolbar buttons can also customize properties like `icon`, `label`, etc., during registration.

- More specifically, in Libro, the commands corresponding to the toolbar buttons are registered using `LibroCommandRegister` to ensure that the logic control functions like `execute`, `isVisible`, and `isEnabled` can access instances of `CellView`, `LibroView`, and `path`. The location options for toolbar buttons are as follows, controlled by the `path` parameter in the `isVisible` function.

| Location Variable Identifier  | Specific Location  |
| :---------------------------- | :----------------- |
| LibroToolbarArea.HeaderLeft   | Top left toolbar   |
| LibroToolbarArea.HeaderCenter | Top center toolbar |
| LibroToolbarArea.HeaderRight  | Top right toolbar  |
| LibroToolbarArea.CellTop      | Cell top toolbar   |
| LibroToolbarArea.CellRight    | Cell right toolbar |

3. Register the newly added command extension class in the Mana module.

```typescript
import { ManaModule } from '@difizen/mana-app';
import { LibroEditorModule } from '../libro-editor/module';
import { LibroDemoToolbarContribution } from './libro-demo-toolbar-contribution';

export const LibroToolbarDemoModule = ManaModule.create()
  .register(LibroDemoToolbarContribution)
  .dependOn(LibroEditorModule);
```

##### Example

```typescript
import { LibroCommandRegister, LibroToolbarArea } from '@difizen/libro-jupyter';
import {
  CommandContribution,
  CommandRegistry,
  inject,
  singleton,
  ToolbarContribution,
  ToolbarRegistry,
} from '@difizen/mana-app';
import {
  BellOutlined,
  BulbOutlined,
  HeartOutlined,
  MoonOutlined,
} from '@ant-design/icons';
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
          console.log('Toolbar button registered in the top center toolbar example');
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
          console.log(
            'Toolbar button registered in the top right toolbar and cell right toolbar example',
          );
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
          console.log(
            'Toolbar button registered in the top right toolbar and cell right toolbar, and grouped example',
          );
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
          console.log(
            'Toolbar button registered in the top right toolbar and cell right toolbar, and grouped example',
          );
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
