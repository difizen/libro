import { LibroServerModule } from '@difizen/libro-kernel';
import { ManaModule } from '@difizen/libro-common/app';

import {
  NotebookAdapter,
  NotebookAdapterFactory,
  NotebookAdapterOptions,
} from './adapters/notebook-adapter.js';
import { DocumentConnectionManager } from './connection-manager.js';
import { LSPConnection, LSPConnectionFactory } from './connection.js';
import { CodeExtractorsManager } from './extractors/index.js';
import { FeatureManager } from './feature.js';
import { LanguageServerManager } from './manager.js';
import { LSPMonitor } from './monitor.js';
import {
  ILanguageServerManagerFactory,
  ILanguageServerManagerOptions,
  ILSPOptions,
} from './tokens.js';
import {
  IVirtualDocumentOptions,
  VirtualDocument,
  VirtualDocumentFactory,
  VirtualDocumentInfo,
  VirtualDocumentInfoFactory,
  VirtualDocumentInfoOptions,
} from './virtual/document.js';

export const LibroLSPModule = ManaModule.create()
  .register(
    // LSPAppContribution,
    DocumentConnectionManager,
    FeatureManager,
    CodeExtractorsManager,
    LanguageServerManager,
    {
      token: ILanguageServerManagerFactory,
      useFactory: (ctx) => {
        return (option: ILanguageServerManagerOptions) => {
          const child = ctx.container.createChild();
          child.register({ token: ILanguageServerManagerOptions, useValue: option });
          return child.get(LanguageServerManager);
        };
      },
    },
    VirtualDocumentInfo,
    {
      token: VirtualDocumentInfoFactory,
      useFactory: (ctx) => {
        return (option: VirtualDocumentInfoOptions) => {
          const child = ctx.container.createChild();
          child.register({ token: VirtualDocumentInfoOptions, useValue: option });
          return child.get(VirtualDocumentInfo);
        };
      },
    },
    VirtualDocument,
    {
      token: VirtualDocumentFactory,
      useFactory: (ctx) => {
        return (option: IVirtualDocumentOptions) => {
          const child = ctx.container.createChild();
          child.register({ token: IVirtualDocumentOptions, useValue: option });
          return child.get(VirtualDocument);
        };
      },
    },
    NotebookAdapter,
    {
      token: NotebookAdapterFactory,
      useFactory: (ctx) => {
        return (option: NotebookAdapterOptions) => {
          const child = ctx.container.createChild();
          child.register({ token: NotebookAdapterOptions, useValue: option });
          return child.get(NotebookAdapter);
        };
      },
    },
    LSPConnection,
    {
      token: LSPConnectionFactory,
      useFactory: (ctx) => {
        return (option: ILSPOptions) => {
          const child = ctx.container.createChild();
          child.register({ token: ILSPOptions, useValue: option });
          return child.get(LSPConnection);
        };
      },
    },
    LSPMonitor,
  )
  .dependOn(LibroServerModule);
