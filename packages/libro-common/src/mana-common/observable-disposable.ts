import type { Disposable } from './disposable';
import type { Event } from './event';

/**
 * A disposable object with an observable `disposed` signal.
 */
export interface ObservableDisposable extends Disposable {
  /**
   * A signal emitted when the object is disposed.
   */
  readonly onDisposed: Event<void>;
}
