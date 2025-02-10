---
title: Quick Integration
order: 0
---

# Overview

Libro offers customizable integration capabilities for both frontend and server-side applications. This guide will walk you through the steps to quickly customize and integrate Libro.

# Frontend Project Integration

## Umi Project Integration

Before starting, ensure your local environment has Node version 18 or above installed.

### Install Dependencies

Install the relevant packages for libro and mana as needed.

```bash
pnpm add @difizen/libro // Install for lab development environment integration

pnpm add @difizen/umi-plugin-mana -D
```

### Update Configuration

1. Add the mana-related configuration for libro’s underlying dependency framework in `.umirc.ts`.

```typescript
export default defineConfig({
  // Import the plugin
  plugins: ['@difizen/umi-plugin-mana'],
  // Configuration
  mana: {
    decorator: true,
    nodenext: true,
    routerBase: true,
    runtime: true,
  },
});
```

In the `tsconfig.json` file at the project root, add the following configuration to address some compile-time errors from mana, libro's underlying dependency framework.

```json
"compilerOptions": {
  "strictPropertyInitialization": false,
  "experimentalDecorators": true,
},
```

### Integrated Import

We provide two ways to introduce the integration: the Lab Dev environment and the Notebook editor.  
The package `'@difizen/libro-lab'` includes both forms—the Lab Dev environment corresponds to `'@difizen/libro-lab'`, while the Notebook editor corresponds to `'@difizen/libro-jupyter'`.

You can import them in the following two ways:

- **Method 1**

Import from the `'@difizen/libro'` package:

```typescript
import { LibroLab } from '@difizen/libro';

const { LibroLabModule } = LibroLab;
```

- **Method 2**

Import from the `'@difizen/libro-lab'` package:

```typescript
import { LibroLabModule } from '@difizen/libro-lab';
```

#### Integrate Lab Development Environment

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/libro_en.png" width="1200" />

1. Connect to the Notebook Service: You can do this by installing `libro-server` or by using Jupyter’s functionality, such as Jupyter server or Jupyter lab. Start the service, obtain the corresponding service link, and update the link on the frontend as follows:

```typescript
import {
  ServerConnection,
  ServerManager,
  AppExtention,
  AppIOC,
} from '@difizen/libro-lab';

const { ApplicationContribution } = AppExtention;
const { singleton, inject } = AppIOC; // 仅给 github 的用户

@singleton({ contrib: ApplicationContribution })
export class LibroApp implements ApplicationContribution {
  @inject(ServerConnection) serverConnection: ServerConnection;
  @inject(ServerManager) serverManager: ServerManager;

  async onStart() {
    this.serverConnection.updateSettings({
      baseUrl: 'http://localhost:8888/',
      wsUrl: 'ws://localhost:8888/',
    });
    this.serverManager.launch();
  }
}
```

2. Create and register a `ManaModule`.

```typescript
import { LibroApp } from './app';
import { LibroLabModule, AppExtention } from '@difizen/libro-lab';

const { ManaModule } = AppExtention;
export const LabModule = ManaModule.create()
  .register(LibroApp)
  .dependOn(LibroLabModule);
```

3. Implement the `LibroLab` React component. The `ManaComponents.Application` component wraps the mana application, enabling all mana modules to share the same context.

```typescript
import React from 'react';
import { AppExtention } from '@difizen/libro-lab';
import { LabModule } from '@/modules/libro-lab/module';
import './index.less'

const { ManaAppPreset, ManaComponents } = AppExtention;

const App = (): JSX.Element => {
  return (
    <div className="libro-workbench-app">
      <ManaComponents.Application
        key="libro-lab"
        asChild={true}
        modules={[ManaAppPreset, LabModule]}
      />
    </div>
  );
};

export default App;
```

#### Integrate Notebook Editor

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/libro_editor.png" width="1000" />

1. Create a React component for the Libro editor, using `LibroService` to create a `LibroView` instance and render it through `ViewRender`.

```typescript
import { DocumentCommands, LibroService, LibroView, AppExtention, AppIOC } from '@difizen/libro-jupyter';
import React, { useEffect, useState } from 'react';

const { CommandRegistry, ViewRender } = AppExtention;
const { useInject } = AppIOC;
export const LibroEditor: React.FC = () => {
  const libroService = useInject<LibroService>(LibroService);
  const [libroView, setLibroView] = useState<LibroView | undefined>();
  const [handle, setHandle] = useState<number | undefined>();
  const commandRegistry = useInject(CommandRegistry);

  const save = () => {
    commandRegistry.executeCommand(
      DocumentCommands['Save'].id,
      undefined,
      libroView,
      undefined,
      { reason: 'autoSave' },
    );
  };

  const doAutoSave = () => {
    const handle = window.setTimeout(() => {
      save();
      if (libroView) {
        libroView.model.dirty = false;
      }
    }, 1000);
    setHandle(handle);
  }

  useEffect(() => {
    libroService.getOrCreateView().then((libro) => {
      if (!libro) return;
      setLibroView(libro);
      libro.model.onChanged(() => {
        doAutoSave();
      });
    });

    return () => {
      window.clearTimeout(handle);
    }
  }, []);

  return (
    <div className="libro-editor-container">
      {libroView && <ViewRender view={libroView} />}
    </div>
  );
};
```

2. Configure the editor's data source. For more details, see the documentation.

```typescript
import type {
  IContentsModel,
  INotebookContent,
  LibroJupyterModel,
  NotebookOption,
} from '@difizen/libro-jupyter';
import { ContentContribution, AppIOC } from '@difizen/libr-jupyter';

const { singleton } = AppIOC;

@singleton({ contrib: ContentContribution })
export class LibroEditorContentContribution implements ContentContribution {
  canHandle = () => 10;

  async loadContent(options: NotebookOption, model: LibroJupyterModel) {
    const notebookContent: INotebookContent = require('./libro-demo.json');
    const currentFileContents: IContentsModel = {
      name: 'libro-demo.ipynb',
      path: '/libro-demo.ipynb',
      type: 'notebook',
      writable: true,
      created: 'libro',
      last_modified: 'libro',
      content: notebookContent,
    };
    currentFileContents.content.nbformat_minor = 5;
    model.currentFileContents = currentFileContents;
    model.filePath = currentFileContents.path;
    model.lastModified = model.currentFileContents.last_modified;
    if (model.executable) {
      model.startKernelConnection();
    }
    return notebookContent;
  }
}
```

3. Create and register a `mana` module.

```typescript
import { LibroApp } from './app';
import { LibroJupyterModule, AppExtention } from '@difizen/libro-jupyter';

import { LibroEditorContentContribution } from './libro-content-contribution';
const { ManaModule } = AppExtention;
export const LibroEditorModule = ManaModule.create()
  .register(LibroApp, LibroEditorContentContribution)
  .dependOn(LibroJupyterModule);
```

4. Use the `LibroEditor` React component. Wrap it with `ManaComponents.Application` to enable shared context for multiple `LibroView` instances.

> Note: Add `renderChildren` to render the children components within `ManaComponents.Application`.

```typescript
import React from 'react';
import { AppExtention } from '@difizen/libro-jupyter';

import './index.less';
import { LibroEditorModule } from '@/modules/libro-editor/module';
import { LibroEditor } from './libro-editor';

const { ManaAppPreset, ManaComponents } = AppExtention;
const App = (): JSX.Element => {
  return (
    <div className="libro-editor-demo">
      <ManaComponents.Application
        key="libro-editor"
        modules={[ManaAppPreset, LibroEditorModule]}
        renderChildren
        asChild={true}
      >
        <LibroEditor />
      </ManaComponents.Application>
    </div>
  );
};

export default App;
```
