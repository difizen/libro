---
title: Custom Commands
order: 1
---

# Commands

Commands are one of the core interaction mechanisms in Libro. They provide a standardized way for users to trigger specific actions or features. This mechanism can be called by users through the interface or keyboard shortcuts, and it can also be executed programmatically within code.

## How to Use Commands

1. **Access the Command Service**: In a React component, you can use `useInject` to get access to the command service. In a Mana module class, use `@inject(CommandRegistry) commandRegistry: CommandRegistry` to access the command service.
2. **Execute a Command**: `commandRegistry.executeCommand` is the main method for executing commands. It accepts the following parameters:

- `commandId`: The unique identifier for the command, specifying which command to execute.
- `args`: Optional arguments for the command's execution function.

### Usage in a React Component

Tip: To use commands in a React component, ensure that the component is within the Mana app’s context.

#### Example

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
    commandRegistry.executeCommand(
      DocumentCommands['Save'].id,
      undefined,
      libroView,
      undefined
    );
  };

  const selectAll = () => {
    commandRegistry.executeCommand(
      NotebookCommands['SelectAll'].id,
      undefined,
      libroView,
      undefined
    );
  };

  const runAllCells = () => {
    commandRegistry.executeCommand(
      NotebookCommands['RunAllCells'].id,
      undefined,
      libroView,
      undefined
    );
  };

  const insertCellBelow = () => {
    commandRegistry.executeCommand(
      NotebookCommands['InsertCellBelow'].id,
      libroView?.activeCell,
      libroView,
      undefined
    );
  };

  useEffect(() => {
    libroService.getOrCreateView({ }).then((libro)=>{
      if(!libro) return;
      setLibroView(libro);
    })
  }, []);

  return (
    <div className='libro-command-container'>
      <div className='libro-command-demo-panel'>
        <Button type='primary' onClick={save} className='libro-command-demo-btn'>Save File</Button>
        <Button type='primary' onClick={selectAll} className='libro-command-demo-btn'>Select All Cells</Button>
        <Button type='primary' onClick={runAllCells} className='libro-command-demo-btn'>Run All Cells</Button>
        <Button type='primary' onClick={insertCellBelow} className='libro-command-demo-btn'>Insert Cell Below</Button>
      </div>
      {libroView && <ViewRender view={libroView}/>}
    </div>
  );
}
```

### Usage in a Class

#### Example

```typescript
import { DocumentCommands, LibroView, NotebookCommands } from '@difizen/libro-jupyter';
import { CommandRegistry, inject, singleton } from '@difizen/mana-app';

@singleton()
export class LibroCommandDemoService {
  @inject(CommandRegistry) commandRegistry: CommandRegistry;

  save = (libroView: LibroView | undefined) => {
    this.commandRegistry.executeCommand(
      DocumentCommands['Save'].id,
      undefined,
      libroView,
      undefined,
    );
  };

  selectAll = (libroView: LibroView | undefined) => {
    this.commandRegistry.executeCommand(
      NotebookCommands['SelectAll'].id,
      undefined,
      libroView,
      undefined,
    );
  };

  runAllCells = (libroView: LibroView | undefined) => {
    this.commandRegistry.executeCommand(
      NotebookCommands['RunAllCells'].id,
      undefined,
      libroView,
      undefined,
    );
  };

  insertCellBelow = (libroView: LibroView | undefined) => {
    this.commandRegistry.executeCommand(
      NotebookCommands['InsertCellBelow'].id,
      libroView?.activeCell,
      libroView,
      undefined,
    );
  };
}
```

## How to Register a Custom Command

In Libro, each module can add commands to the command registry. Basic commands generally include the following components:

- `id`: Unique identifier for the command.
- `label`: Description for the command, used in menus or command panels.
- `handler`: The function executed when the command is triggered.

### Command Definition

Defining a command mainly involves specifying a unique identifier (`id`) and a readable label (`label`) for each command. This forms the core of the command system, establishing the command's identity and display.

#### Custom Command Definition Example

```typescript
export const LibroDemoCommand = {
  demoCommand1: {
    id: 'demo:libro-command-1',
    label: 'Demo Command Example 1',
  },
  demoCommand2: {
    id: 'demo:libro-command-2',
    label: 'Demo Command Example 2',
  },
};
```

### Command Implementation

1. **Implement the Handler**: The handler is the command’s core part, responsible for controlling its behavior. It includes three optional functions:

- `execute`: The logic for executing the command, called when the command is triggered.
- `isEnabled`: Determines if the command is enabled. If it returns false, the command cannot be executed or clicked.
- `isVisible`: Determines if the command is visible. If it returns false, the command won’t appear in the UI, such as menus or toolbars.
  For more details on `isEnabled` and `isVisible`, see: [xxx].

2. **Register the Command**: Libro uses dependency injection to manage command registration, so you need to create a command extension class and register commands within it. The command extension class implements the `CommandContribution` interface, providing a `registerCommands` method specifically for registering commands. Additionally, `LibroCommandRegister` and `CommandRegistry` can both be used to register commands.

- `LibroCommandRegister`: When using this approach, the command’s parameters are: `CellView` instance, `LibroView` instance, position (for details on this parameter, see: [xxx]). Even if no arguments are passed at command execution, the handler can access the `CellView` and `LibroView` instances.
- `CommandRegistry`: When using this approach, only parameters passed during command execution are accessible within the handler.

3. **Register the Command Extension Class in the Mana Module**

```typescript
export const LibroCommandDemoModule = ManaModule.create()
  .register(LibroCommandDemoService, LibroDemoCommandContribution)
  .dependOn(LibroEditorModule);
```

#### Custom Command Registration Example

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
          'DemoCommand1 registered via LibroCommandRegister has been executed',
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
          'DemoCommand2 registered via CommandRegistry has been executed',
          args1,
          args2,
        );
      },
    });
  }
}
```
