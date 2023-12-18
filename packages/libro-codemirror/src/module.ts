import { CodeEditorModule } from '@difizen/libro-code-editor';
import { ManaModule } from '@difizen/mana-app';

import { CodeMirrorEditorContribution } from './editor-contribution.js';

export const CodeMirrorEditorModule = ManaModule.create()
  .register(CodeMirrorEditorContribution)
  .dependOn(CodeEditorModule);
