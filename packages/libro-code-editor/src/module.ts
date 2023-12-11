import { ManaModule } from '@difizen/mana-app';

import { CodeEditorInfoManager } from './code-editor-info-manager.js';
import { CodeEditorContribution, CodeEditorManager } from './code-editor-manager.js';
import { Model } from './code-editor-model.js';
import { CodeEditorSettings } from './code-editor-settings.js';
import { CodeEditorView } from './code-editor-view.js';

export const CodeEditorModule = ManaModule.create()
  .register(
    CodeEditorInfoManager,
    CodeEditorView,
    CodeEditorManager,
    Model,
    CodeEditorSettings,
  )
  .contribution(CodeEditorContribution);
