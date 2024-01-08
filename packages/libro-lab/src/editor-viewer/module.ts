import { ManaModule } from '@difizen/mana-app';

import { CodeEditorViewerOpenHandler } from './code-editor-open-handler.js';
import { CodeEditorViewer } from './code-editor-viewer.js';
import { LibroDefaultViewerOpenHandler } from './libro-default-open-handler.js';
import { LibroDefaultViewer } from './libro-default-viewer.js';

export const CodeEditorViewerModule = ManaModule.create(
  'CodeEditorViewerModule',
).register(
  CodeEditorViewer,
  LibroDefaultViewer,
  CodeEditorViewerOpenHandler,
  LibroDefaultViewerOpenHandler,
);
