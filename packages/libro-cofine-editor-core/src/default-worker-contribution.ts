import type { LanguageWorkerRegistry } from '@difizen/libro-cofine-editor-contribution';
import { LanguageWorkerContribution } from '@difizen/libro-cofine-editor-contribution';
import { inject, singleton } from '@difizen/libro-common/app';

import pkg from '../package.json';

import { MonacoLoaderConfig } from './monaco-loader.js';

@singleton({ contrib: LanguageWorkerContribution })
export class DefaultWorkerContribution implements LanguageWorkerContribution {
  config: MonacoLoaderConfig;
  constructor(@inject(MonacoLoaderConfig) config: MonacoLoaderConfig) {
    this.config = config;
  }
  registerLanguageWorkers(registry: LanguageWorkerRegistry) {
    registry.registerWorker({
      language: 'editorWorkerService',
      getWorkerUrl: () => {
        return `data:text/javascript;charset=utf-8,${encodeURIComponent(
          `importScripts('https://unpkg.com/@difizen/libro-cofine-editor-core@${pkg.version}/dist/worker/editor.worker.min.js')`,
        )}`;
      },
    });
  }
}
