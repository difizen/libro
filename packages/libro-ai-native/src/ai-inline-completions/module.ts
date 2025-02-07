import { CodeEditorModule } from '@difizen/libro-code-editor';
import { ManaModule } from '@difizen/libro-common/app';

import { AICompletionContribution } from './inline-completion-contribution.js';
import { AICompletionProvider } from './inline-completion-provider.js';
import { AiCompletionRequest } from './inline-completion-request.js';

export const LibroAICompletionModule = ManaModule.create()
  .register(AiCompletionRequest, AICompletionProvider, AICompletionContribution)
  .dependOn(CodeEditorModule);
