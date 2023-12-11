import {
  LanguageWorkerRegistry,
  LazyLoaderRegistry,
} from '@difizen/libro-cofine-editor-contribution';
import type { Syringe } from '@difizen/mana-app';
import { Deferred } from '@difizen/mana-app';
import { GlobalContainer } from '@difizen/mana-app';
import * as monaco from '@difizen/monaco-editor-core';

import { InitializeProvider } from './initialize-provider.js';
import {
  DefaultLoaderConfig,
  MonacoLoader,
  MonacoLoaderConfig,
} from './monaco-loader.js';
import BaseModule from './monaco-module.js';

export const MonacoEnvironmentBound = 'MonacoEnvironmentBound';

export type ModuleLoader = (container: Syringe.Container) => void;
type InitType = {
  lazy: boolean;
  cdnUrl?: string;
};
export class MonacoEnvironment {
  static container: Syringe.Container;
  static loaders: ModuleLoader[] = [];
  static preLoaders: ModuleLoader[] = [];
  static monaco: typeof monaco;
  protected static loader?: MonacoLoader;
  protected static moduleLoadStart = false;
  protected static moduleInitDeferred: Deferred<void> = new Deferred<void>();
  protected static baseModule?: Syringe.Module;
  static lazy = false;

  static setContainer = (container: Syringe.Container) => {
    MonacoEnvironment.container = container;
    if (!container.isBound(MonacoEnvironmentBound)) {
      container.register(MonacoEnvironmentBound, { useValue: true });
      MonacoEnvironment.container.register(MonacoLoaderConfig, {
        useValue: DefaultLoaderConfig,
      });
      container.register(MonacoLoader);
    }
  };
  static async load(cdnUrl?: string) {
    if (!MonacoEnvironment.container) {
      MonacoEnvironment.setContainer(GlobalContainer);
    }
    if (!MonacoEnvironment.loader) {
      MonacoEnvironment.loader = MonacoEnvironment.container.get(MonacoLoader);
    }
    await MonacoEnvironment.loader.load(cdnUrl);
  }
  static async init(
    { lazy, cdnUrl }: InitType | undefined = { lazy: false, cdnUrl: '' },
  ): Promise<void> {
    if (!MonacoEnvironment.monaco) {
      await MonacoEnvironment.load(cdnUrl!);
    }
    window.MonacoEnvironment = {
      getWorkerUrl: (moduleId: string, label: string) => {
        const workerRegistry = MonacoEnvironment.container.get(LanguageWorkerRegistry);
        return workerRegistry.getLanguageWorker(label, moduleId);
      },
    };
    try {
      if (!MonacoEnvironment.baseModule) {
        MonacoEnvironment.baseModule = BaseModule;
        MonacoEnvironment.container.load(MonacoEnvironment.baseModule);
      }
      MonacoEnvironment.lazy = lazy;
      if (!lazy) {
        await MonacoEnvironment.initModule();
      } else {
        for (const loader of MonacoEnvironment.preLoaders) {
          await loader(MonacoEnvironment.container);
        }
        const initialize = MonacoEnvironment.container.get(InitializeProvider);
        await initialize.initialize(monaco);
      }
    } catch (ex) {
      console.error(ex);
    }
  }

  static async initModule() {
    if (!MonacoEnvironment.loaders.length) {
      return;
    }
    for (const loader of MonacoEnvironment.loaders) {
      await loader(MonacoEnvironment.container);
    }
    MonacoEnvironment.loaders = [];
    try {
      const initialize = MonacoEnvironment.container.get(InitializeProvider);
      await initialize.initialize(monaco);
      if (MonacoEnvironment.lazy) {
        const layzInit = MonacoEnvironment.container.get(LazyLoaderRegistry);
        await layzInit.handleLazyLoder();
      }
    } catch (e) {
      console.error(e);
    }
  }

  static async loadModule(loader: ModuleLoader) {
    MonacoEnvironment.loaders.push(loader);
  }

  // 提前加载（懒加载模式下需要提前加载的模块）
  static async preLoadModule(loader: ModuleLoader) {
    MonacoEnvironment.preLoaders.push(loader);
  }
}
