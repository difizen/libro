import type { Disposable, Event as ManaEvent } from '@difizen/libro-common/mana-app';
import { Emitter } from '@difizen/libro-common/mana-app';
import { singleton } from '@difizen/libro-common/mana-app';

import type { ISettings, NetworkError } from './server/index.js';
/**
 * A disposable object with an observable `disposed` signal.
 */
export interface ObservableDisposable extends Disposable {
  /**
   * A signal emitted when the object is disposed.
   */
  readonly onDisposed: ManaEvent<void>;
}

/**
 * Object which manages kernel instances for a given base url.
 *
 * #### Notes
 * The manager is responsible for maintaining the state of kernel specs.
 */
export interface IManager extends ObservableDisposable {
  /**
   * A signal emitted when there is a connection failure.
   */
  connectionFailure: ManaEvent<NetworkError>;

  /**
   * The server settings for the manager.
   */
  readonly serverSettings: ISettings;

  /**
   * Whether the manager is ready.
   */
  readonly isReady: boolean;

  /**
   * A promise that resolves when the manager is initially ready.
   */
  readonly ready: Promise<void>;

  /**
   * Whether the manager is active.
   */
  readonly isActive: boolean;
}

@singleton()
export class BaseManager implements IManager {
  // constructor(options: BaseManager.IOptions) {
  //   this.serverSettings = options.serverSettings ?? ServerConnection.makeSettings();
  // }
  /**
   * A signal emitted when the delegate is disposed.
   */
  get onDisposed(): ManaEvent<void> {
    return this.onDisposedEmitter.event;
  }

  /**
   * A signal emitted when there is a connection failure.
   */
  get connectionFailure(): ManaEvent<Error> {
    return this.connectionFailureEmitter.event;
  }

  /**
   * Test whether the delegate has been disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
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
   * Whether the manager is active.
   */
  get isActive(): boolean {
    return true;
  }

  /**
   * Dispose of the delegate and invoke the callback function.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this.onDisposedEmitter.fire(undefined);
    this.onDisposedEmitter.dispose();
  }

  /**
   * The server settings of the manager.
   */
  readonly serverSettings: ISettings;

  protected _isDisposed = false;
  protected onDisposedEmitter = new Emitter<void>();

  protected connectionFailureEmitter = new Emitter<Error>();
  _isReady = false;
  _ready: Promise<void>;
}

/**
 * The namespace for `BaseManager` class statics.
 */
export namespace BaseManager {
  /**
   * The options used to initialize a SessionManager.
   */
  export interface IOptions {
    /**
     * The server settings for the manager.
     */
    serverSettings?: ISettings;
  }
}
