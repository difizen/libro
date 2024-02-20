import { Poll } from '@difizen/libro-common';
import type { Event as ManaEvent } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';
import { prop, getOrigin } from '@difizen/mana-app';
import { Emitter } from '@difizen/mana-app';

import { NetworkError, ServerManager } from '../server/index.js';

import type {
  KernelId,
  IKernelConnection,
  KernelStatus,
  KernelConnectionOptions,
  IKernelModel,
  KernelMeta,
} from './libro-kernel-protocol.js';
import {
  LibroKernelFactory,
  LibroKernelConnectionFactory,
} from './libro-kernel-protocol.js';
import type { LibroKernel } from './libro-kernel.js';
import type { IKernelOptions } from './restapi.js';
import { KernelRestAPI } from './restapi.js';

@singleton()
export class LibroKernelManager {
  @inject(LibroKernelFactory) kernelfactory: LibroKernelFactory;
  @inject(LibroKernelConnectionFactory)
  kernelConnectionFactory: LibroKernelConnectionFactory;

  @inject(KernelRestAPI) kernelRestAPI: KernelRestAPI;

  @prop()
  kernelMap = new Map<KernelId, LibroKernel>();

  @prop()
  private _models = new Map<string, KernelMeta>();

  protected _pollModels: Poll;
  protected _isReady = false;
  protected _ready: Promise<void>;

  protected serverManager: ServerManager;
  protected connectToKernelEmitter = new Emitter();
  get onConnectToKernel() {
    return this.connectToKernelEmitter.event;
  }

  get kernelIds() {
    return Array.from(this.kernelMap.keys());
  }

  getLibroKernel(kernelId: KernelId) {
    return this.kernelMap.get(kernelId);
  }

  get runningKernels(): Map<string, KernelMeta> {
    return this._models;
  }

  constructor(@inject(ServerManager) serverManager: ServerManager) {
    this.serverManager = serverManager;

    // Start model and specs polling with exponential backoff.
    this._pollModels = new Poll({
      auto: false,
      factory: () => this.requestRunning(),
      frequency: {
        interval: 10 * 1000,
        backoff: true,
        max: 300 * 1000,
      },
      name: `@jupyterlab/services:KernelManager#models`,
      // standby: options.standby ?? 'when-hidden',
      standby: 'when-hidden',
    });

    // Initialize internal data.
    this._ready = (async () => {
      await this.serverManager.ready;
      await getOrigin(this._pollModels).start();
      await getOrigin(this._pollModels).tick;
      this._isReady = true;
    })();
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
   * Start a new kernel.
   *
   * @param createOptions - The kernel creation options
   *
   * @param connectOptions - The kernel connection options
   *
   * @returns A promise that resolves with the kernel connection.
   *
   * #### Notes
   * The manager `serverSettings` will be always be used.
   */
  async startNew(
    createOptions: IKernelOptions = {},
    connectOptions: Omit<KernelConnectionOptions, 'model' | 'serverSettings'> = {},
  ): Promise<IKernelConnection> {
    const model = await this.kernelRestAPI.startNew(createOptions);
    return this.connectToKernel({
      ...connectOptions,
      model,
    });
  }

  /**
   * A signal emitted when the running kernels change.
   */
  get runningChanged(): ManaEvent<IKernelModel[]> {
    return this.runningChangedEmitter.event;
  }

  /**
   * A signal emitted when there is a connection failure.
   */
  get connectionFailure(): ManaEvent<Error> {
    return this.connectionFailureEmmiter.event;
  }

  /**
   * Shut down a kernel by id.
   *
   * @param id - The id of the target kernel.
   *
   * @returns A promise that resolves when the operation is complete.
   */
  async shutdown(id: string): Promise<void> {
    await this.kernelRestAPI.shutdownKernel(id);
    await this.refreshRunning();
  }

  /**
   * Shut down all kernels.
   */
  async shutdownAll(): Promise<void> {
    // Update the list of models to make sure our list is current.
    await this.refreshRunning();

    // Shut down all models.
    await Promise.all(
      [...this._models.keys()].map((id) => this.kernelRestAPI.shutdownKernel(id)),
    );

    // Update the list of models to clear out our state.
    await this.refreshRunning();
  }

  async connectToKernel(options: KernelConnectionOptions) {
    const kernelConnection = this.kernelConnectionFactory(options);
    this.startKernel(kernelConnection);
    this.connectToKernelEmitter.fire(kernelConnection);
    return kernelConnection;
  }

  // 通过kernel id判断kernel是否仍然存在
  async isKernelAlive(id: string): Promise<boolean> {
    try {
      const data = await this.kernelRestAPI.getKernelModel(id);
      return !!data;
    } catch {
      return false;
    }
  }

  async startKernel(kernelConnection: IKernelConnection) {
    kernelConnection.statusChanged(this._onStatusChanged.bind(this));
    kernelConnection.onDisposed(() => this._onDisposed.bind(this)(kernelConnection));
  }

  protected _onDisposed(kernelConnection: IKernelConnection) {
    this.kernelMap.delete(kernelConnection.id);
    // A dispose emission could mean the server session is deleted, or that
    // the kernel JS object is disposed and the kernel still exists on the
    // server, so we refresh from the server to make sure we reflect the
    // server state.

    void this.refreshRunning().catch(() => {
      /* no-op */
    });
  }

  protected _onStatusChanged(status: KernelStatus) {
    if (status === 'dead') {
      // We asynchronously update our list of kernels, which asynchronously
      // will dispose them. We do not want to immediately dispose them because
      // there may be other signal handlers that want to be called.
      void this.refreshRunning().catch(() => {
        /* no-op */
      });
    }
  }

  /**
   * Force a refresh of the running kernels.
   *
   * @returns A promise that resolves when the running list has been refreshed.
   *
   * #### Notes
   * This is not typically meant to be called by the user, since the
   * manager maintains its own internal state.
   */
  async refreshRunning(): Promise<void> {
    await getOrigin(this._pollModels).refresh();
    await getOrigin(this._pollModels).tick;
  }

  protected connectionFailureEmmiter = new Emitter<Error>();
  protected runningChangedEmitter = new Emitter<IKernelModel[]>();

  /**
   * Execute a request to the server to poll running kernels and update state.
   */
  protected async requestRunning(): Promise<void> {
    let models: KernelMeta[];

    try {
      models = await this.kernelRestAPI.listRunning();
    } catch (err: any) {
      // Handle network errors, as well as cases where we are on a
      // JupyterHub and the server is not running. JupyterHub returns a
      // 503 (<2.0) or 424 (>2.0) in that case.
      if (
        err instanceof NetworkError ||
        err.response?.status === 503 ||
        err.response?.status === 424
      ) {
        this.connectionFailureEmmiter.fire(err);
      }
      throw err;
    }

    if (
      this._models.size === models.length &&
      models.every((model) => {
        const existing = this._models.get(model.id);
        if (!existing) {
          return false;
        }
        return (
          existing.connections === model.connections &&
          existing.execution_state === model.execution_state &&
          existing.last_activity === model.last_activity &&
          existing.name === model.name &&
          existing.reason === model.reason &&
          existing.traceback === model.traceback
        );
      })
    ) {
      // Identical models list (presuming models does not contain duplicate
      // ids), so just return
      return;
    }

    this._models = new Map(models.map((x) => [x.id, x]));
  }
}
