---
title: 快速集成
order: 0
---

# 概览

Libro 提供了前端和服务侧的定制接入能力，本文将手把手教你快速定制接入。

# 前端项目接入

## Umi 项目接入

在开始运行前，请先保证本地的环境已经安装 node 版本是 18 或以上。

### 安装依赖

安装 libro , mana 相关的依赖包，可按照需要安装。

```bash
pnpm add @difizen/mana-app
pnpm add @difizen/libro-lab
pnpm add @difizen/mana-core
pnpm add @difizen/mana-common
pnpm add @difizen/mana-observable
pnpm add @difizen/mana-syringe

pnpm add @difizen/umi-plugin-mana -D
```

### 修改配置

1. 在 .umirc.ts 中增加 libro 底层依赖框架 mana 相关的配置。

```typescript
export default defineConfig({
  // 引入
  plugins: ['@difizen/umi-plugin-mana'],
  // 配置
  mana: {
    decorator: true,
    nodenext: true,
    routerBase: true,
    runtime: true,
  },
});
```

在项目根目录中的 tsconfig.json 文件中添加如下配置，从而满足 libro 的底层依赖框架 mana 中的一些编译提示报错。

```json
"compilerOptions": {
  "strictPropertyInitialization": false,
  "experimentalDecorators": true,
},
```

### 集成 Lab 研发环境

<img
    src="https://mdn.alipayobjects.com/huamei_zabatk/afts/img/A*u40VR6qi_E0AAAAAAAAAAAAADvyTAQ/original"
    width="1200"
/>

1. 连接 Notebook 服务：这里您可以通过安装 libro-server ，也可以使用 jupyter 的能力，例如 jupyter server 或者 jupyter lab。启动服务，获得对应的服务链接，并可以按照下述方式在前端侧更新服务链接。

```typescript
import { ServerConnection, ServerManager } from '@difizen/libro-jupyter';
import { ConfigurationService } from '@difizen/mana-app';
import { ApplicationContribution } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';

@singleton({ contrib: ApplicationContribution })
export class LibroApp implements ApplicationContribution {
  @inject(ServerConnection) serverConnection: ServerConnection;
  @inject(ServerManager) serverManager: ServerManager;
  @inject(ConfigurationService) configurationService: ConfigurationService;

  async onStart() {
    this.serverConnection.updateSettings({
      baseUrl: 'http://localhost:8888/',
      wsUrl: 'ws://localhost:8888/',
    });
    this.serverManager.launch();
  }
}
```

2. 通过下述方式实现关于 LibroLab 的 React 组件，其中，需要把上面实现的用于连接 Notebook 服务的 LibroApp 注册进 ManaModule 中。

```typescript
import { LibroLabModule } from '@difizen/libro-lab';
import { ManaAppPreset, ManaComponents, ManaModule } from '@difizen/mana-app';
import { LibroApp } from './app.js';
import './index.less';

const BaseModule = ManaModule.create().register(LibroApp);

const LibroLab = (): JSX.Element => {
    return (
        <ManaComponents.Application
        key={'libro-lab'}
        asChild={true}
        modules={[ManaAppPreset, LibroLabModule, BaseModule]}
        />
    );
};

export default LibroLab;
```

### 集成 Notebook 编辑器

1. 编写 Libro 编辑器的 React 组件，核心是通过 LibroService 创建 LibroView 实例，并通过 ViewRender 渲染构建出的 LibroView 实例。

```typescript
import { LibroService, LibroView } from '@difizen/libro-jupyter';
import { ViewRender, useInject } from '@difizen/mana-app';
import { useEffect, useState } from 'react';
export const LibroEditor: React.FC<LibroEditorProps> = (props, ref)=>{
    const libroService = useInject(LibroService);
    const [libroView,setLibroView] = useState<LibroView|undefined>();

    useEffect(() => {
        libroService.getOrCreateView({
        //每个 libro 编辑器标识，用于区分每次打开编辑器里面的内容都不一样
        }).then((libro)=>{
            if(!libro) return;
            setLibroView(libro);
            libro.model.onChanged(() => {
                doAutoSave();
            });
        })
        return ()=>{
            window.clearTimeout(handle);
        }
    }, []);

    return (
        <div className='libro-editor-container'>
        {libroView && <ViewRender view={libroView}/>}
        </div>
    );
}
```

2. 消费 Libro 编辑器的 React 组件，在使用 LibroEditor 的最外层包上 ManaComponents.Application ，使得多个 LibroView 的实例可以共享上下文。

```typescript
import { LibroEditor } from './LibroEditor'
export const App: React.FC = () => {
    return (
        <ManaComponents.Application
            modules={[ManaAppPreset, LibroJupyterModule]}
            renderChildren >
            <LibroEditor xxx = {xxx}>
        </ManaComponents.Application>
    )
}
```
