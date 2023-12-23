import { ManaModule } from '@difizen/mana-app';

import { CodeEditorViewerOpenHandler } from './code-editor-open-handler.js';
import { CodeEditorViewer } from './code-editor-viewer.js';

export const CodeEditorViewerModule = ManaModule.create(
  'CodeEditorViewerModule',
).register(CodeEditorViewer, CodeEditorViewerOpenHandler);
