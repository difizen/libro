import type { LibroView } from '@difizen/libro-core';
import { LibroService } from '@difizen/libro-core';
import { ServerManager } from '@difizen/libro-kernel';
import { ApplicationContribution } from '@difizen/libro-common/app';
import { inject, singleton } from '@difizen/libro-common/app';

import { NotebookAdapterFactory } from './adapters/notebook-adapter.js';
import {
  ILSPCodeExtractorsManager,
  ILSPDocumentConnectionManager,
  ILSPFeatureManager,
} from './tokens.js';

@singleton({ contrib: [ApplicationContribution] })
export class LSPAppContribution implements ApplicationContribution {
  @inject(LibroService) libroService: LibroService;
  @inject(ServerManager) serverManager: ServerManager;

  @inject(ILSPDocumentConnectionManager)
  connectionManager: ILSPDocumentConnectionManager;
  @inject(ILSPFeatureManager) featureManager: ILSPFeatureManager;
  @inject(ILSPCodeExtractorsManager) codeExtractorManager: ILSPCodeExtractorsManager;
  @inject(NotebookAdapterFactory) notebookAdapterFactory: NotebookAdapterFactory;

  onStart() {
    /**
     * FIXME：capability声明应该和具体的实现写在一起
     */
    this.featureManager.register({
      id: 'libro-lsp',
      capabilities: {
        textDocument: {
          completion: {
            completionItem: { documentationFormat: ['markdown'] },
          },
          diagnostic: {
            dynamicRegistration: true,
          },
          /**
           * jedi-lsp的hover功能没有用hover的格式配置，而是使用completion的格式配置。。。
           */
          hover: {
            dynamicRegistration: true,
            contentFormat: ['markdown', 'plaintext'],
          },
          signatureHelp: {
            dynamicRegistration: true,
            contextSupport: true,
            signatureInformation: {
              activeParameterSupport: true,
              documentationFormat: ['markdown'],
              parameterInformation: {
                labelOffsetSupport: true,
              },
            },
          },
        },
      },
    });
    this.setupNotebookLanguageServer();
  }

  setupNotebookLanguageServer() {
    this.libroService.onNotebookViewCreated(async (notebook) => {
      this.activateNotebookLanguageServer(notebook);
    });
  }

  /**
   * Activate the language server for notebook.
   */
  async activateNotebookLanguageServer(notebook: LibroView): Promise<void> {
    await notebook.initialized;
    await this.serverManager.ready;

    const adapter = this.notebookAdapterFactory({
      editorWidget: notebook,
      connectionManager: this.connectionManager,
      featureManager: this.featureManager,
      foreignCodeExtractorsManager: this.codeExtractorManager,
    });

    this.connectionManager.registerAdapter(notebook.model.id, adapter);
  }
}
