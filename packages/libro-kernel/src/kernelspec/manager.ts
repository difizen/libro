import { deepEqual, Poll } from '@difizen/libro-common';
import type { Event as ManaEvent } from '@difizen/mana-app';
import { Emitter, Deferred } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';
import { prop } from '@difizen/mana-app';

import { BaseManager } from '../basemanager.js';
import { ServerManager } from '../server/server-manager.js';

import type * as KernelSpec from './kernelspec.js';
import type { ISpecModels } from './restapi.js';
import { KernelSpecRestAPI } from './restapi.js';

/**
 * An implementation of a kernel spec manager.
 */
@singleton()
export class KernelSpecManager extends BaseManager implements KernelSpec.IManager {
  @inject(ServerManager)
  protected serverManager: ServerManager;
  @inject(KernelSpecRestAPI)
  protected kernelSpecRestAPI: KernelSpecRestAPI;

  /**
   * Construct a new kernel spec manager.
   *
   * @param options - The default options for kernel.
   */
  constructor() {
    super();

    // Initialize internal data.
    this._ready = Promise.all([this.requestSpecs()])
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .then((_) => undefined)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch((_) => undefined)
      .then(() => {
        if (this.isDisposed) {
          return;
        }
        this._isReady = true;
        return;
      });

    this._pollSpecs = new Poll({
      auto: false,
      factory: () => this.requestSpecs(),
      frequency: {
        interval: 61 * 1000,
        backoff: true,
        max: 300 * 1000,
      },
      name: `@jupyterlab/services:KernelSpecManager#specs`,
      standby: 'when-hidden',
      // standby: options.standby ?? 'when-hidden',
    });
    void this.ready.then(() => {
      void this._pollSpecs.start();
      return;
    });
  }

  /**
   * The server settings for the manager.
   */
  // readonly serverSettings: ServerConnection.ISettings;

  /**
   * Test whether the manager is ready.
   */
  // get isReady(): boolean {
  //   return this._isReady;
  // }

  /**
   * A promise that fulfills when the manager is ready.
   */
  // get ready(): Promise<void> {
  //   return this._ready;
  // }

  get specsReady() {
    return this.specsDeferred.promise;
  }

  /**
   * Get the most recently fetched kernel specs.
   */
  get specs(): ISpecModels | null {
    return this._specs;
  }

  /**
   * A signal emitted when the specs change.
   */
  get specsChanged(): ManaEvent<ISpecModels> {
    return this.specsChangedEmitter.event;
  }

  /**
   * A signal emitted when there is a connection failure.
   */
  override get connectionFailure(): ManaEvent<Error> {
    return this.connectionFailureEmitter.event;
  }

  /**
   * Dispose of the resources used by the manager.
   */
  override dispose(): void {
    this._pollSpecs.dispose();
    super.dispose();
  }

  /**
   * Force a refresh of the specs from the server.
   *
   * @returns A promise that resolves when the specs are fetched.
   *
   * #### Notes
   * This is intended to be called only in response to a user action,
   * since the manager maintains its internal state.
   */
  async refreshSpecs(): Promise<void> {
    await this._pollSpecs.refresh();
    await this._pollSpecs.tick;
  }

  /**
   * Execute a request to the server to poll specs and update state.
   */
  protected async requestSpecs(): Promise<void> {
    const specs = await this.kernelSpecRestAPI.getSpecs(this.serverSettings);
    if (specs) {
      this.specsDeferred.resolve(specs);
    }

    if (this.isDisposed) {
      return;
    }
    if (!this._specs || !deepEqual(specs, this._specs)) {
      this._specs = specs;
      this.specsChangedEmitter.fire(specs);
    }
  }

  // protected _isReady = false;
  protected override connectionFailureEmitter = new Emitter<Error>();

  protected _pollSpecs: Poll;
  // protected _ready: Promise<void>;

  @prop()
  protected _specs: ISpecModels | null = null;
  protected specsChangedEmitter = new Emitter<ISpecModels>();
  protected specsDeferred = new Deferred<ISpecModels>();
}

/**
 * The namespace for `KernelManager` class statics.
 */
export namespace KernelSpecManager {
  /**
   * The options used to initialize a KernelManager.
   */
  export interface IOptions extends BaseManager.IOptions {
    /**
     * When the manager stops polling the API. Defaults to `when-hidden`.
     */
    standby?: Poll.Standby | (() => boolean | Poll.Standby);
  }
}
