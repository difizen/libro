import { CodeEditorModule } from '@difizen/libro-code-editor';
import { ManaModule } from '@difizen/mana-app';

import { AIWidgetCommandContribution } from './ai-widget-command-contribution.js';
import { AIWidgetCommandRegister } from './ai-widget-command-register.js';
import { AIWidget } from './ai-widget.js';

export const LibroAIWidgetModule = ManaModule.create()
  .register(AIWidget, AIWidgetCommandRegister, AIWidgetCommandContribution)
  .dependOn(CodeEditorModule);
