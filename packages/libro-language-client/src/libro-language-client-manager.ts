import { URL } from '@difizen/libro-common';
import { PageConfig } from '@difizen/libro-kernel';
import type { ILanguageServerManager, TSessionMap } from '@difizen/libro-lsp';
import { ILanguageServerManagerFactory } from '@difizen/libro-lsp';
import { singleton, inject, postConstruct, getOrigin } from '@difizen/mana-app';

import type { LibroLanguageClientOptions } from './libro-language-client.js';
import { LibroLanguageClient } from './libro-language-client.js';

interface IConnectionData {
  connection: WebSocket;
  languageClient: LibroLanguageClient;
}

// TODO: type is not complete
export type LSPFeatureType = 'textDocument/formatting';

@singleton()
export class LibroLanguageClientManager {
  @inject(ILanguageServerManagerFactory)
  protected readonly languageServerManagerFactory: ILanguageServerManagerFactory;

  protected languageServerManager: ILanguageServerManager;

  protected clientMap = new Map<string, IConnectionData>();

  @postConstruct()
  init() {
    this.languageServerManager = this.languageServerManagerFactory({});
  }

  protected serverUri(languageServerId: string) {
    const wsBase = PageConfig.getBaseUrl().replace(/^http/, 'ws');
    return URL.join(wsBase, 'lsp', 'ws', languageServerId);
  }

  async getServers(language = 'python') {
    await this.languageServerManager.ready;
    const serverIds = this.languageServerManager.getMatchingServers({
      language,
    });
    return serverIds;
  }

  async getServerSpecs(language = 'python') {
    await this.languageServerManager.ready;
    const specs = this.languageServerManager.getMatchingSpecs({
      language,
    });
    return specs;
  }

  async refreshRunning() {
    await this.languageServerManager.refreshRunning();
  }

  get sessionsChanged() {
    return this.languageServerManager.sessionsChanged;
  }

  get sessions() {
    const res: TSessionMap = new Map();
    this.languageServerManager.sessions.forEach((item, key) => {
      if (item.status === 'started') {
        res.set(key, item);
      }
    });
    return res;
  }

  async getOrCreateLanguageClient(
    languageServerId: string,
    options: LibroLanguageClientOptions,
  ) {
    if (this.clientMap.has(languageServerId)) {
      return this.clientMap.get(languageServerId);
    }
    const url = this.serverUri(languageServerId);
    const client = await this.createLanguageClient(url, options);
    this.clientMap.set(languageServerId, client);
    this.refreshRunning();
    return client;
  }

  protected createLanguageClient = (
    url: string,
    options: LibroLanguageClientOptions,
  ) => {
    return LibroLanguageClient.createWebSocketLanguageClient(url, options);
  };

  async closeLanguageClient(languageServerId: string) {
    await getOrigin(this.clientMap.get(languageServerId)?.languageClient)?.dispose();
    getOrigin(this.clientMap.get(languageServerId)?.connection)?.close();
    this.clientMap.delete(languageServerId);
    this.refreshRunning();
  }

  async closeAllLanguageClient() {
    const servers = await this.getServers();
    await Promise.all(servers.map((server) => this.closeLanguageClient(server)));
    this.refreshRunning();
  }

  async getFeatureStatus(
    feature: LSPFeatureType,
    language = 'python',
  ): Promise<boolean> {
    let featureEnabled = false;
    const serverids = await this.getServers(language);
    serverids.forEach((id) => {
      const featureState = this.clientMap
        .get(id)
        ?.languageClient.getFeature(feature)
        .getState();
      if (featureState?.kind === 'document' && featureState.registrations === true) {
        featureEnabled = true;
      }
      if (featureState?.kind === 'workspace' && featureState.registrations === true) {
        featureEnabled = true;
      }
      if (featureState?.kind === 'window' && featureState.registrations === true) {
        featureEnabled = true;
      }
      if (featureState?.kind === 'static') {
        featureEnabled = true;
      }
    });
    return featureEnabled;
  }
}
