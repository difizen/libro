export * from './module.js';
export * from './lab-app.js';
export * from './github-link/index.js';
export * from './config/index.js';
export * from './layout/index.js';
export * from './command/index.js';
export * from './toc/index.js';
export * from './welcome/index.js';
export * from './kernel-manager/index.js';
export * from './kernel-and-terminal-panel/index.js';
export * from './common/index.js';
export * from './image-viewer/index.js';
export * from './editor-viewer/index.js';
export * from '@difizen/libro-prompt-cell';
export * from '@difizen/libro-sql-cell';
export * from '@difizen/libro-terminal';
export * from '@difizen/libro-toc';
export * from '@difizen/libro-widget';
export * from '@difizen/libro-app';
export * from '@difizen/libro-cofine-editor-core';
export * from '@difizen/libro-language-client';
export * from '@difizen/libro-jupyter';

import * as SyringeModules from '@difizen/libro-common/ioc';
import * as ObservableModules from '@difizen/libro-common/observable';

export const AppIOC = {
  ...ObservableModules,
  ...SyringeModules,
};

export * as AppExtention from '@difizen/libro-common/app';
