import { ManaModule } from '@difizen/mana-app';

import { CodeEditorView } from './code-editor-view.js';
import { Model } from './model.js';

export const CodeEditorModule = ManaModule.create().register(CodeEditorView, Model);
