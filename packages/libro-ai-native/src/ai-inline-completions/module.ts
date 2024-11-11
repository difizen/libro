import { ManaModule } from '@difizen/mana-app';

import { CompletionRequest } from './inline-completion-request.js';
import { AICompletionProvider } from './inline-completions-provider.js';

export const LibroAICompletionModule = ManaModule.create().register(
  CompletionRequest,
  AICompletionProvider,
);
