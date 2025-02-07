import { LibroLSPModule } from '@difizen/libro-lsp';
import { ManaModule } from '@difizen/libro-common/app';

import { LibroWindow } from './common/vscodeAdaptor/libroWindow.js';
import { LibroWorkspace } from './common/vscodeAdaptor/libroWorkspace.js';
import { LSPEnv } from './common/vscodeAdaptor/lspEnv.js';
import { MonacoLanguages } from './common/vscodeAdaptor/monacoLanguages.js';
import { setupLspEnv } from './common/vscodeAdaptor/vscodeAdaptor.js';
import { LibroLanguageClientContribution } from './libro-language-client-contribution.js';
import { LibroLanguageClientManager } from './libro-language-client-manager.js';

export const LibroLanguageClientModule = ManaModule.create()
  .register(LibroLanguageClientManager, LibroLanguageClientContribution, LSPEnv)
  .register(MonacoLanguages, LibroWindow, LibroWorkspace)
  .dependOn(LibroLSPModule)
  .preload((ctx) => {
    setupLspEnv(ctx.container);
    return Promise.resolve();
  });
