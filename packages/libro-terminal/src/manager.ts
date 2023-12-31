// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Poll } from '@difizen/libro-common';
import { NetworkError, ServerConnection } from '@difizen/libro-kernel';
import type { Disposable, Disposed, Event } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';
import { Emitter, inject } from '@difizen/mana-app';
import { v4 } from 'uuid';

import type { TerminalConnection } from './connection.js';
import type { TerminalModel, TerminalOption } from './protocol.js';
import { TerminalConnectionFactory } from './protocol.js';
import { TerminalRestAPI } from './restapi.js';

@singleton()
export class TerminalManager implements Disposable, Disposed {
  disposed = false;
  protected _isReady = false;
  protected _pollModels: Poll;
  protected _terminalConnections = new Set<TerminalConnection>();
  protected _ready: Promise<void>;
  protected _runningChanged = new Emitter<TerminalModel[]>();
  protected _connectionFailure = new Emitter<Error>();
  // As an optimization, we unwrap the models to just store the names.
  protected _names: string[] = [];
  protected get _models(): TerminalModel[] {
    return this._names.map((name) => {
      return { name };
    });
  }

  @inject(TerminalRestAPI) terminalRestAPI: TerminalRestAPI;
  // @inject(ServerConnection) serverConnection: ServerConnection;
  @inject(TerminalConnectionFactory)
  terminalConnectionFactory: TerminalConnectionFactory;
  serverConnection: ServerConnection;

  /**
   * Construct a new terminal manager.
   */
  constructor(@inject(ServerConnection) serverConnection: ServerConnection) {
    this.serverConnection = serverConnection;
    //
    // Start polling with exponential backoff.
    this._pollModels = new Poll({
      auto: false,
      factory: () => this.requestRunning(),
      frequency: {
        interval: 10 * 1000,
        backoff: true,
        max: 300 * 1000,
      },
      name: `@jupyterlab/services:TerminalManager#models`,
      standby: 'when-hidden',
    });

    // Initialize internal data.
    this._ready = (async () => {
      await this._pollModels.start();
      await this._pollModels.tick;
      this._isReady = true;
    })();
  }

  /**
   * The server settings of the manager.
   */
  get serverSettings() {
    return this.serverConnection.settings;
  }

  /**
   * Test whether the manager is ready.
   */
  get isReady(): boolean {
    return this._isReady;
  }

  /**
   * A promise that fulfills when the manager is ready.
   */
  get ready(): Promise<void> {
    return this._ready;
  }

  /**
   * A signal emitted when the running terminals change.
   */
  get runningChanged(): Event<TerminalModel[]> {
    return this._runningChanged.event;
  }

  /**
   * A signal emitted when there is a connection failure.
   */
  get connectionFailure(): Event<Error> {
    return this._connectionFailure.event;
  }

  /**
   * Dispose of the resources used by the manager.
   */
  dispose(): void {
    if (this.disposed) {
      return;
    }
    this._names.length = 0;
    this._terminalConnections.forEach((x) => x.dispose());
    this._pollModels.dispose();
    this.disposed = true;
  }

  /*
   * Connect to a running terminal.
   *
   * @param options - The options used to connect to the terminal.
   *
   * @returns The new terminal connection instance.
   *
   * #### Notes
   * The manager `serverSettings` will be used.
   */
  connectTo(options: { name: string }): TerminalConnection {
    const terminalConnection = this.terminalConnectionFactory(options);
    this._onStarted(terminalConnection);
    if (!this._names.includes(options.name)) {
      // We trust the user to connect to an existing session, but we verify
      // asynchronously.
      void this.refreshRunning().catch(() => {
        /* no-op */
      });
    }
    return terminalConnection;
  }

  /**
   * Create an iterator over the most recent running terminals.
   *
   * @returns A new iterator over the running terminals.
   */
  running(): IterableIterator<TerminalModel> {
    return this._models[Symbol.iterator]();
  }

  /**
   * Force a refresh of the running terminals.
   *
   * @returns A promise that with the list of running terminals.
   *
   * #### Notes
   * This is intended to be called only in response to a user action,
   * since the manager maintains its internal state.
   */
  async refreshRunning(): Promise<void> {
    await this._pollModels.refresh();
    await this._pollModels.tick;
  }

  /**
   * Create a new terminal session.
   *
   * @param options - The options used to create the terminal.
   *
   * @returns A promise that resolves with the terminal connection instance.
   *
   * #### Notes
   * The manager `serverSettings` will be used unless overridden in the
   * options.
   */
  async startNew(options: TerminalOption): Promise<TerminalConnection> {
    const model = await this.terminalRestAPI.startNew(options, this.serverSettings);
    await this.refreshRunning();
    return this.connectTo({ ...options, name: model.name });
  }

  /**
   * Shut down a terminal session by name.
   */
  async shutdown(name: string): Promise<void> {
    await this.terminalRestAPI.shutdown(name, this.serverSettings);
    await this.refreshRunning();
  }

  /**
   * Shut down all terminal sessions.
   *
   * @returns A promise that resolves when all of the sessions are shut down.
   */
  async shutdownAll(): Promise<void> {
    // Update the list of models to make sure our list is current.
    await this.refreshRunning();

    // Shut down all models.
    await Promise.all(
      this._names.map((name) =>
        this.terminalRestAPI.shutdown(name, this.serverSettings),
      ),
    );

    // Update the list of models to clear out our state.
    await this.refreshRunning();
  }

  /**
   * Execute a request to the server to poll running terminals and update state.
   */
  async requestRunning(): Promise<void> {
    let models: TerminalModel[];
    try {
      models = await this.terminalRestAPI.listRunning(this.serverSettings);
    } catch (err) {
      // Handle network errors, as well as cases where we are on a
      // JupyterHub and the server is not running. JupyterHub returns a
      // 503 (<2.0) or 424 (>2.0) in that case.
      if (
        err instanceof NetworkError ||
        (err as any).response?.status === 503 ||
        (err as any).response?.status === 424
      ) {
        this._connectionFailure.fire(err as any);
      }
      throw err;
    }

    if (this.disposed) {
      return;
    }

    const names = models.map(({ name }) => name).sort();
    if (names === this._names) {
      // Identical models list, so just return
      return;
    }

    this._names = names;
    this._terminalConnections.forEach((tc) => {
      if (!names.includes(tc.name)) {
        tc.dispose();
      }
    });
    this._runningChanged.fire(this._models);
  }

  /**
   * Handle a session starting.
   */
  protected _onStarted(terminalConnection: TerminalConnection): void {
    this._terminalConnections.add(terminalConnection);
    terminalConnection.onDisposed(() => {
      this._onDisposed(terminalConnection);
    });
  }

  /**
   * Handle a session terminating.
   */
  protected _onDisposed(terminalConnection: TerminalConnection): void {
    this._terminalConnections.delete(terminalConnection);
    // Update the running models to make sure we reflect the server state
    void this.refreshRunning().catch(() => {
      /* no-op */
    });
  }

  getOrCreate = async (options: TerminalOption) => {
    const { name, cwd } = options;
    let connection;
    if (name) {
      const models = await this.terminalRestAPI.listRunning();
      if (models.map((d) => d.name).includes(name)) {
        // we are restoring a terminal widget and the corresponding terminal exists
        // let's connect to it
        connection = this.connectTo({ name });
      } else {
        // we are restoring a terminal widget but the corresponding terminal was closed
        // let's start a new terminal with the original name
        connection = await this.startNew({ name, cwd });
      }
    } else {
      // we are creating a new terminal widget with a new terminal
      // let the server choose the terminal name
      connection = await this.startNew({ cwd });
    }
    return connection;
  };
  newTerminalName = () => {
    return v4();
  };
}
