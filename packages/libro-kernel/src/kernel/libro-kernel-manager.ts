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
} from './libro-kernel-protocol.js';
import {
  LibroKernelFactory,
  LibroKernelConnectionFactory,
} from './libro-kernel-protocol.js';
import type { LibroKernel } from './libro-kernel.js';
import { KernelRestAPI } from './restapi.js';

@singleton()
export class LibroKernelManager {
  @inject(LibroKernelFactory) kernelfactory: LibroKernelFactory;
  @inject(LibroKernelConnectionFactory)
  kernelConnectionFactory: LibroKernelConnectionFactory;

  @inject(KernelRestAPI) kernelRestAPI: KernelRestAPI;

  @prop()
  kernelMap = new Map<KernelId, LibroKernel>();

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
    try {
      await this.kernelRestAPI.listRunning();
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
  }
}
