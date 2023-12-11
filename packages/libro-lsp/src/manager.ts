// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { URL } from '@difizen/libro-common';
import type { ISettings } from '@difizen/libro-kernel';
import { PageConfig, ServerConnection, ServerManager } from '@difizen/libro-kernel';
import type { Event } from '@difizen/mana-app';
import { Deferred, Emitter } from '@difizen/mana-app';
import { inject, postConstruct, transient } from '@difizen/mana-app';

import type { ServerSpecProperties } from './schema.js';
import { ILanguageServerManagerOptions, URL_NS } from './tokens.js';
import type {
  IGetServerIdOptions,
  ILanguageServerManager,
  TLanguageServerConfigurations,
  TLanguageServerId,
  TSessionMap,
  TSpecsMap,
} from './tokens.js';

@transient()
export class LanguageServerManager implements ILanguageServerManager {
  @inject(ServerConnection) serverConnection!: ServerConnection;
  @inject(ServerManager) serverManager!: ServerManager;
  constructor(
    @inject(ILanguageServerManagerOptions) options: ILanguageServerManagerOptions,
  ) {
    this._baseUrl = options.baseUrl || PageConfig.getBaseUrl();
    this._retries = options.retries || 2;
    this._retriesInterval = options.retriesInterval || 10000;
    this._statusCode = -1;
    this._configuration = {};
  }

  @postConstruct()
  init() {
    this.serverManager.ready
      .then(() => {
        this.fetchSessions();
        return;
      })
      .catch(console.error);
  }

  /**
   * Check if the manager is enabled or disabled
   */
  get isEnabled(): boolean {
    return this._enabled;
  }
  /**
   * Check if the manager is disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Get the language server specs.
   */
  get specs(): TSpecsMap {
    return this._specs;
  }

  /**
   * Get the status end point.
   */
  get statusUrl(): string {
    const baseUrl = this.serverConnection.settings.baseUrl ?? this._baseUrl;
    return URL.join(baseUrl, URL_NS, 'status');
  }

  /**
   * Signal emitted when a  language server session is changed
   */
  get sessionsChanged(): Event<void> {
    return this._sessionsChanged.event;
  }

  /**
   * Get the map of language server sessions.
   */
  get sessions(): TSessionMap {
    return this._sessions;
  }

  /**
   * A promise resolved when this server manager is ready.
   */
  get ready(): Promise<void> {
    return this._ready.promise;
  }

  /**
   * Get the status code of server's responses.
   */
  get statusCode(): number {
    return this._statusCode;
  }

  /**
   * Enable the language server services
   */
  async enable(): Promise<void> {
    this._enabled = true;
    await this.fetchSessions();
  }

  /**
   * Disable the language server services
   */
  disable(): void {
    this._enabled = false;
    this._sessions = new Map();
    this._sessionsChanged.fire(void 0);
  }

  /**
   * Dispose the manager.
   */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
  }

  /**
   * Update the language server configuration.
   */
  setConfiguration(configuration: TLanguageServerConfigurations): void {
    this._configuration = configuration;
  }

  /**
   * Get matching language server for input language option.
   *
   * modify lsp server rank on ~/.jupyter/lab/user-settings/@jupyterlab/lsp-extension
   */
  getMatchingServers(options: IGetServerIdOptions): TLanguageServerId[] {
    if (!options.language) {
      console.error(
        'Cannot match server by language: language not available; ensure that kernel and specs provide language and MIME type',
      );
      return [];
    }

    const matchingSessionsKeys: TLanguageServerId[] = [];

    for (const [key, session] of this._sessions.entries()) {
      if (this.isMatchingSpec(options, session.spec)) {
        matchingSessionsKeys.push(key);
      }
    }

    return matchingSessionsKeys.sort(this.compareRanks.bind(this));
  }

  /**
   * Get matching language server spec for input language option.
   */
  getMatchingSpecs(options: IGetServerIdOptions): TSpecsMap {
    const result: TSpecsMap = new Map();

    for (const [key, specification] of this._specs.entries()) {
      if (this.isMatchingSpec(options, specification)) {
        result.set(key, specification);
      }
    }
    return result;
  }

  /**
   * Fetch the server session list from the status endpoint. The server
   * manager is ready once this method finishes.
   */
  async fetchSessions(): Promise<void> {
    if (!this._enabled) {
      return;
    }
    const response = await this.serverConnection.makeRequest(this.statusUrl, {});

    this._statusCode = response.status;
    if (!response.ok) {
      if (this._retries > 0) {
        this._retries -= 1;
        setTimeout(this.fetchSessions.bind(this), this._retriesInterval);
      } else {
        this._ready.resolve(undefined);
        console.warn('Missing jupyter_lsp server extension, skipping.');
      }
      return;
    }

    let sessions: Record<string, any>;

    try {
      const data = await response.json();
      sessions = data.sessions;
      try {
        this.version = data.version;
        this._specs = new Map(Object.entries(data.specs)) as TSpecsMap;
      } catch (err) {
        console.warn(err);
      }
    } catch (err) {
      console.warn(err);
      this._ready.resolve(undefined);
      return;
    }

    for (const key of Object.keys(sessions)) {
      const id: TLanguageServerId = key as TLanguageServerId;
      if (this._sessions.has(id)) {
        Object.assign(this._sessions.get(id)!, sessions[key]);
      } else {
        this._sessions.set(id, sessions[key]);
      }
    }

    const oldKeys = this._sessions.keys();

    for (const oldKey in oldKeys) {
      if (!sessions[oldKey]) {
        const oldId = oldKey as TLanguageServerId;
        this._sessions.delete(oldId);
      }
    }
    this._sessionsChanged.fire(void 0);
    this._ready.resolve(undefined);
  }

  /**
   * Version number of sever session.
   */
  protected version: number;

  /**
   * Check if input language option maths the language server spec.
   */
  protected isMatchingSpec(
    options: IGetServerIdOptions,
    spec: ServerSpecProperties,
  ): boolean {
    // most things speak language
    // if language is not known, it is guessed based on MIME type earlier
    // so some language should be available by now (which can be not so obvious, e.g. "plain" for txt documents)
    const lowerCaseLanguage = options.language!.toLocaleLowerCase();
    return spec.languages!.some(
      (language: string) => language.toLocaleLowerCase() === lowerCaseLanguage,
    );
  }

  /**
   * Helper function to warn a message only once.
   */
  protected warnOnce(arg: string): void {
    if (!this._warningsEmitted.has(arg)) {
      this._warningsEmitted.add(arg);
      console.warn(arg);
    }
  }

  /**
   * Compare the rank of two servers with the same language.
   */
  protected compareRanks(a: TLanguageServerId, b: TLanguageServerId): number {
    const DEFAULT_RANK = 50;
    const defaultServerRank: Record<TLanguageServerId, number> = {
      'pyright-extended': DEFAULT_RANK + 3,
      pyright: DEFAULT_RANK + 2,
      pylsp: DEFAULT_RANK + 1,
      'bash-language-server': DEFAULT_RANK,
      'dockerfile-language-server-nodejs': DEFAULT_RANK,
      'javascript-typescript-langserver': DEFAULT_RANK,
      'unified-language-server': DEFAULT_RANK,
      'vscode-css-languageserver-bin': DEFAULT_RANK,
      'vscode-html-languageserver-bin': DEFAULT_RANK,
      'vscode-json-languageserver-bin': DEFAULT_RANK,
      'yaml-language-server': DEFAULT_RANK,
      'r-languageserver': DEFAULT_RANK,
    } as const;
    const aRank = this._configuration[a]?.rank ?? defaultServerRank[a] ?? DEFAULT_RANK;
    const bRank = this._configuration[b]?.rank ?? defaultServerRank[b] ?? DEFAULT_RANK;

    if (aRank === bRank) {
      this.warnOnce(
        `Two matching servers: ${a} and ${b} have the same rank; choose which one to use by changing the rank in Advanced Settings Editor`,
      );
      return a.localeCompare(b);
    }
    // higher rank = higher in the list (descending order)
    return bRank - aRank;
  }

  /**
   * map of language server sessions.
   */
  protected _sessions: TSessionMap = new Map();

  /**
   * Map of language server specs.
   */
  protected _specs: TSpecsMap = new Map();

  /**
   * Server connection setting.
   */
  protected _settings: ISettings;

  /**
   * Base URL to connect to the language server handler.
   */
  protected _baseUrl: string;

  /**
   * Status code of server response
   */
  protected _statusCode: number;

  /**
   * Number of connection retry, default to 2.
   */
  protected _retries: number;

  /**
   * Interval between each retry, default to 10s.
   */
  protected _retriesInterval: number;

  /**
   * Language server configuration.
   */
  protected _configuration: TLanguageServerConfigurations;

  /**
   * Set of emitted warning message, message in this set will not be warned again.
   */
  protected _warningsEmitted = new Set<string>();

  /**
   * A promise resolved when this server manager is ready.
   */
  protected _ready = new Deferred<void>();

  /**
   * Signal emitted when a  language server session is changed
   */
  protected _sessionsChanged = new Emitter<void>();

  protected _isDisposed = false;

  /**
   * Check if the manager is enabled or disabled
   */
  protected _enabled = true;
}
