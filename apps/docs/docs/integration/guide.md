---
title: 常见集成场景
order: 1
---

# 命令

命令（Command）是 Libro 中的核心交互机制之一，主要作用是提供一种标准化的方式，允许用户触发特定操作或功能。这种机制不仅能由用户通过界面或快捷键调用，也能在代码中通过编程方式执行。

## 如何使用命令？

1. 获取命令服务：在 React 组件中你可以使用 useInject 来获取到命令服务；在 mana 模块类中，您可以使用 @inject(CommandRegistry) commandRegistry: CommandRegistry获取到命令服务.
2. 执行命令：commandRegistry.executeCommand 是命令执行的核心方法。它接受以下几个参数：

- commandId: 命令的唯一标识符，指明要执行的具体命令。
- args: 可选参数，用于传递给命令的执行函数。

### React 组件中使用

提示：关于在 React 组件中使用首先需要保证该 React 组件存在于 mana 应用的上下文中。

#### 示例

```jsx
import { DocumentCommands, LibroService, LibroView, NotebookCommands } from '@difizen/libro-jupyter';
import { CommandRegistry, ViewRender, useInject } from '@difizen/mana-app';
import React,{ useEffect, useState } from 'react';
import { Button } from 'antd';

export const LibroEditor: React.FC = ()=>{
  const libroService = useInject<LibroService>(LibroService);
  const [libroView,setLibroView] = useState<LibroView|undefined>();
  const commandRegistry = useInject(CommandRegistry);

  const save = () => {
    //通过命令进行保存
    commandRegistry.executeCommand(
      DocumentCommands['Save'].id,
      undefined,
      libroView,
      undefined
    );
  };

  const selectAll = () => {
    //通过命令进行 cell 全选操作
    commandRegistry.executeCommand(
      NotebookCommands['SelectAll'].id,
      undefined,
      libroView,
      undefined
    );
  };

  const runAllCells = () => {
    //通过命令进行执行全部 cell 操作
    commandRegistry.executeCommand(
      NotebookCommands['RunAllCells'].id,
      undefined,
      libroView,
      undefined
    );
  };

  const insertCellBelow = () => {
    //通过命令进行向下插入 cell 操作
    commandRegistry.executeCommand(
      NotebookCommands['InsertCellBelow'].id,
      libroView?.activeCell,
      libroView,
      undefined
    );
  };

  useEffect(() => {
    libroService.getOrCreateView({
      //这里可以给每个 libro 编辑器增加标识，用于区分每次打开编辑器里面的内容都不一样
    }).then((libro)=>{
      if(!libro) return;
      setLibroView(libro);
    })
  }, []);

  return (
    <div className='libro-command-container'>
      <div className='libro-command-demo-panel'>
        <Button type='primary' onClick={save} className='libro-command-demo-btn'>保存文件</Button>
        <Button type='primary' onClick={selectAll} className='libro-command-demo-btn'>全选 Cell</Button>
        <Button type='primary' onClick={runAllCells} className='libro-command-demo-btn'>执行所有 Cell</Button>
        <Button type='primary' onClick={insertCellBelow} className='libro-command-demo-btn'>向下新增 Cell</Button>
      </div>
      {libroView && <ViewRender view={libroView}/>}
    </div>
  );
}
```

### mana 模块类中使用

#### 示例

```jsx
import { DocumentCommands, LibroView, NotebookCommands } from '@difizen/libro-jupyter';
import { CommandRegistry, inject, singleton } from '@difizen/mana-app';

@singleton()
export class LibroCommandDemoService {
    @inject(CommandRegistry) commandRegistry: CommandRegistry;

    save = (libroView:LibroView|undefined) => {
        //通过命令进行保存
        this.commandRegistry.executeCommand(
          DocumentCommands['Save'].id,
          undefined,
          libroView,
          undefined
        );
    };

    selectAll = (libroView:LibroView|undefined) => {
        //通过命令进行 cell 全选操作
        this.commandRegistry.executeCommand(
          NotebookCommands['SelectAll'].id,
          undefined,
          libroView,
          undefined
        );
    };

    runAllCells = (libroView:LibroView|undefined) => {
        //通过命令进行执行全部 cell 操作
        this.commandRegistry.executeCommand(
          NotebookCommands['RunAllCells'].id,
          undefined,
          libroView,
          undefined
        );
    };

    insertCellBelow = (libroView:LibroView|undefined) => {
        //通过命令进行向下插入 cell 操作
        this.commandRegistry.executeCommand(
          NotebookCommands['InsertCellBelow'].id,
          libroView?.activeCell,
          libroView,
          undefined
        );
    };
}
```

## 如何注册自定义命令？

在 libro 中，每个模块都可以向命令注册表中添加命令。最基础的命令通常包含这几个部分：

- id: 命令的唯一标识符。
- label: 命令的描述，用于菜单或命令面板。
- handler: 命令被触发时的执行函数。

### 命令定义

定义命令主要是为每个命令指定一个唯一的标识符（id）和一个可读的标签（label）。这是命令系统的基础部分，它决定了命令在应用程序中的身份和展示方式。

#### 自定义命令定义示例

```typescript
export const LibroDemoCommand = {
  demoCommand1: {
    id: 'demo:libro-command-1',
    label: '普通命令demo示例1',
  },
  demoCommand2: {
    id: 'demo:libro-command-2',
    label: '普通命令demo示例2',
  },
};
```

### 命令实现

1. 实现命令的 handler，handler 是命令的核心部分，负责控制命令的行为。它包含以下三个可选函数：

- execute: 命令执行的具体逻辑，用户触发命令时会调用此函数。
- isEnabled: 判断命令是否处于可用状态。如果返回 false，命令将不可执行且不可点击。
- isVisible: 判断命令是否可见。如果返回 false，命令不会显示在菜单或工具栏等 UI 中。
  关于 isEnabled、isVisible 的更多内容详情请看：xxx

2. 注册命令。libro 使用依赖注入机制来管理命令的注册，因此你需要创建一个命令扩展类，并在这个类中注册命令。命令扩展类实现了 CommandContribution 接口，这个接口提供了 registerCommands 方法，专门用于注册命令。此外，提供了 LibroCommandRegister 和 CommandRegistry两种方式注册命令。

- LibroCommandRegister：使用该种方式意味着，当前命令的参数依次是：CellView 实例、LibroView 实例、position（关于该参数的解释详情请看：xxx） ,即使在命令执行时没有传递参数，在命令的handler 中也能拿到当前上下的文对应的 CellView 实例、LibroView 实例。
- CommandRegistry：通过该种方式注册则是在命令的handler 中只能拿到命令执行时传递的参数。

3. 把新增的命令扩展类注册进 mana module 中。

```typescript
export const LibroCommandDemoModule = ManaModule.create()
  .register(LibroCommandDemoService, LibroDemoCommandContribution)
  .dependOn(LibroEditorModule);
```

#### 自定义命令注册示例

```typescript
import { LibroCommandRegister } from '@difizen/libro-jupyter';
import {
  CommandContribution,
  CommandRegistry,
  inject,
  singleton,
} from '@difizen/mana-app';
import { LibroDemoCommand } from './libro-demo-command';

@singleton({ contrib: CommandContribution })
export class LibroDemoCommandContribution implements CommandContribution {
  @inject(LibroCommandRegister) protected readonly libroCommand: LibroCommandRegister;

  registerCommands(command: CommandRegistry): void {
    this.libroCommand.registerLibroCommand(command, LibroDemoCommand['demoCommand1'], {
      execute: async (cell, libro, path) => {
        console.log(
          '使用 LibroCommandRegister 的方式注册的 demoCommand1 被执行',
          cell,
          libro,
          path,
        );
      },
      isEnabled: () => {
        return true;
      },
    });
    command.registerCommand(LibroDemoCommand['demoCommand2'], {
      execute: async (args1, args2) => {
        console.log(
          '使用 CommandRegistry 的方式注册的 demoCommand2 被执行',
          args1,
          args2,
        );
      },
    });
  }
}
```
