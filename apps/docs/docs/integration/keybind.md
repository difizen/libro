---
title: 自定义快捷键
order: 3
---

# 快捷键

快捷键在开发者的工作流中非常重要，它们可以大大提高生产力。libro 作为一款交互式笔记本程序, 有着丰富的快捷键来帮助用户完成工作。本篇文章将给您介绍如何开发自定义的快捷键。

## 支持的快捷键

快捷键由修饰键和实际键位组成。以下在 libro 中自定义开发快捷键时所支持的修饰键和按键列表。

### 支持的修饰键

不同操作系统下可用的修饰键如下：
| 位置变量标识 | 具体位置 |
| :---------------------------- | :-------------- |
| LibroToolbarArea.HeaderLeft | 顶部左侧工具栏 |
| LibroToolbarArea.HeaderCenter | 顶部中间工具栏 |
| LibroToolbarArea.HeaderRight | 顶部右侧工具栏 |
| LibroToolbarArea.CellTop | cell 顶部工具栏 |
| LibroToolbarArea.CellRight | cell 右侧工具栏 |

| 平台    | 修饰键                     |
| :------ | :------------------------- |
| macOS   | Ctrl+, Shift+, Alt+, Cmd+  |
| Windows | Ctrl+, Shift+, Alt+, Win+  |
| Linux   | Ctrl+, Shift+, Alt+, Meta+ |

### 支持的按键

除了修饰键之外，以下实际按键也被支持：

- 功能键：f1-f19
- 字母键：a-z
- 数字键：0-9
- 符号键：` `, `-`, `=`, `[`, `]`, `\`, `;`, `'`, `,`, `.`, `/`
- 方向键：left, up, right, down
- 导航键：pageup, pagedown, end, home
- 其他常用键：tab, enter, escape, space, backspace, delete
- 其他功能键：pausebreak, capslock, insert
- 数字键盘：numpad0-numpad9, numpad_multiply, numpad_add, numpad_separator, numpad_subtract, numpad_decimal, numpad_divide

这些按键和修饰键可以组合在一起，用于创建自定义快捷键组合。

## 如何注册自定义快捷键

在 libro 中，快捷键是通过命令系统来实现的。每个快捷键都绑定到一个命令，按下快捷键时，对应的命令就会被执行。

### 快捷键定义

默认注册快捷键与注册命令关联, 最基础的有快捷键定义的命令包含这几个部分：

- id: 命令的唯一标识符。
- keybind: 命令绑定的快捷键,提供如下几种方式：
  - 单一按键：`keybind: 'd'`，单一按键触发生效。
  - 组合按键：`keybind: 'ctrlcmd+shift+d'`，多个按键同时触发生效。
  - 多组按键：`keybind: ['shift+q', 'shift+w']`，一个命令同时绑定多组按键，其中一组按键触发即可生效。
  - 连续按键：`keybind: 'j j'`，按键连续间断触发时生效。
- when: 当命令绑定了快捷键时，该字段用于判断命令快捷键生效的条件，如果命令定义中包含 when: 'commandMode'表示该命令的快捷键只在命令模式下生效，编辑模式下不生效；反之，如果命令定义中不包含该字段，则没有命令模式下生效的条件限制。这里的命令模式快捷键生效的条件设计主要考虑避免用户编辑时也触发快捷键。

#### 示例

```typescript
export const LibroDemoKeybindCommand = {
  demokeybindCommand1: {
    id: 'demo:libro-keybind-command-1',
    keybind: 'ctrlcmd+shift+d',
  },
  demokeybindCommand2: {
    id: 'demo:libro-keybind-command-2',
    keybind: 'shift+d',
    when: 'commandMode',
  },
  demokeybindCommand3: {
    id: 'demo:libro-keybind-command-3',
    keybind: ['shift+q', 'shift+w'],
  },
  demokeybindCommand4: {
    id: 'demo:libro-keybind-command-4',
    keybind: 'w w',
  },
};
```

### 快捷键注册实现

1. 实现命令的 handler (execute、isEnabled)，用于控制快捷键对应的命令的行为。
2. 注册快捷键。libro 使用依赖注入机制来管理快捷键的注册，因此你需要创建一个快捷键扩展类，并在这个类中注册快捷键。快捷键扩展类实现了 `KeybindingContribution` 接口，这个接口提供了`registerKeybindings`方法，专门用于注册快捷键。同时需要通过`LibroCommandRegister`中的`registerKeybinds`方法进行注册，以保证只有当焦点聚焦于当前的 libro 编辑器内以及命令模式的逻辑判断的生效。
3. 把新增的快捷键扩展类注册进 mana module 中。

```typescript
import { ManaModule } from '@difizen/mana-app';
import { LibroEditorModule } from '../libro-editor/module';
import { LibroDemoKeybindingContribution } from './libro-demo-keybind-contribution';

export const LibroKeybindDemoModule = ManaModule.create()
  .register(LibroDemoKeybindingContribution)
  .dependOn(LibroEditorModule);
```

#### 示例

```typescript
import { LibroCommandRegister } from '@difizen/libro-jupyter';
import {
  inject,
  KeybindingRegistry,
  singleton,
  KeybindingContribution,
  CommandContribution,
  CommandRegistry,
} from '@difizen/mana-app';
import { LibroDemoKeybindCommand } from './libro-demo-keybind-command';

@singleton({ contrib: [KeybindingContribution, CommandContribution] })
export class LibroDemoKeybindingContribution
  implements KeybindingContribution, CommandContribution
{
  @inject(LibroCommandRegister) protected readonly libroCommand: LibroCommandRegister;

  registerKeybindings(keybindings: KeybindingRegistry) {
    this.libroCommand.registerKeybinds(keybindings, LibroDemoKeybindCommand);
  }

  registerCommands(command: CommandRegistry): void {
    this.libroCommand.registerLibroCommand(
      command,
      LibroDemoKeybindCommand['demokeybindCommand1'],
      {
        execute: async () => {
          console.log('快捷键demo示例1被触发执行');
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      LibroDemoKeybindCommand['demokeybindCommand2'],
      {
        execute: async () => {
          console.log('快捷键demo示例2被触发执行');
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      LibroDemoKeybindCommand['demokeybindCommand3'],
      {
        execute: async () => {
          console.log('快捷键demo示例3被触发执行');
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      LibroDemoKeybindCommand['demokeybindCommand4'],
      {
        execute: async () => {
          console.log('快捷键demo示例4被触发执行');
        },
      },
    );
  }
}
```
