import { CodeEditorModule } from '@difizen/libro-code-editor';
import { ManaModule } from '@difizen/mana-app';

import { AICompletionContribution } from './inline-completion-contribution.js';
import { AICompletionProvider } from './inline-completion-provider.js';
import { CompletionRequest } from './inline-completion-request.js';

export const LibroAICompletionModule = ManaModule.create()
  .register(CompletionRequest, AICompletionProvider, AICompletionContribution)
  .dependOn(CodeEditorModule);
