import type { Disposable } from '@difizen/libro-common/app';
import { Syringe } from '@difizen/libro-common/app';
import type monaco from '@difizen/monaco-editor-core';

export const EditorHandlerContribution = Syringe.defineToken(
  'LanguageWorkerContribution',
);

export interface EditorHandlerContribution extends Disposable {
  beforeCreate: (coreMonaco: typeof monaco) => void;
  afterCreate: (
    editor: monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor,
    coreMonaco: typeof monaco,
  ) => void;
  canHandle: (language: string) => boolean;
}
export { EditorOptionsRegistry } from './editor-options-registry.js';
export {
  LanguageWorkerContribution,
  LanguageWorkerRegistry,
} from './language-worker-registry.js';
export {
  LazyLoaderRegistry,
  LazyLoaderRegistryContribution,
} from './lazy-loader-registry.js';
export { LanguageOptionsRegistry } from './options-registry.js';
