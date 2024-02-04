import { ApplicationContribution, inject, singleton } from '@difizen/mana-app';

import { CloseAction, ErrorAction } from './common/api.js';
import { LSPEnv } from './common/vscodeAdaptor/lspEnv.js';
import { workspace } from './common/vscodeAdaptor/vscodeAdaptor.js';
import { LibroLanguageClientManager } from './libro-language-client-manager.js';

@singleton({ contrib: [ApplicationContribution] })
export class LibroLanguageClientContribution implements ApplicationContribution {
  @inject(LibroLanguageClientManager)
  protected readonly libroLanguageClientManager: LibroLanguageClientManager;

  @inject(LSPEnv)
  protected readonly lspEnv: LSPEnv;

  async onViewStart() {
    // not block
    this.startLanguageClients();
  }

  async startLanguageClients() {
    await this.lspEnv.ready;
    const serverIds = await this.libroLanguageClientManager.getServers();

    for (const serverId of serverIds) {
      await this.libroLanguageClientManager.getOrCreateLanguageClient(serverId, {
        name: `${serverId} Language Client`,
        clientOptions: {
          // use a language id as a document selector
          documentSelector: [{ language: 'python' }],
          // disable the default error handler
          errorHandler: {
            error: () => ({ action: ErrorAction.Continue }),
            closed: () => ({ action: CloseAction.DoNotRestart }),
          },
          // pyright requires a workspace folder to be present, otherwise it will not work
          // workspaceFolder: {
          //   index: 0,
          //   name: 'workspace',
          //   uri: URI.parse('/examples'), // abs path
          // },
          synchronize: {
            fileEvents: [workspace.createFileSystemWatcher('**', false)],
          },
        },
      });
    }
  }
}
