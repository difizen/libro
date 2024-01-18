import { ManaModule } from '@difizen/mana-app';

import { CodeEditorInfoManager } from './code-editor-info-manager.js';
import { CodeEditorManager } from './code-editor-manager.js';
import { Model } from './code-editor-model.js';
import { CodeEditorContribution } from './code-editor-protocol.js';
import { CodeEditorSettings } from './code-editor-settings.js';
import { CodeEditorStateManager } from './code-editor-state-manager.js';
import { CodeEditorView } from './code-editor-view.js';

export const CodeEditorModule = ManaModule.create()
  .register(
    CodeEditorInfoManager,
    CodeEditorView,
    CodeEditorManager,
    Model,
    CodeEditorSettings,
    CodeEditorStateManager,
  )
  .contribution(CodeEditorContribution);
