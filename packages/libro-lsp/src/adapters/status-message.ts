// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Emitter } from '@difizen/libro-common/mana-app';
import type { Disposable } from '@difizen/libro-common/mana-app';

export class StatusMessage implements Disposable {
  /**
   * Timeout reference used to clear the previous `setTimeout` call.
   */
  protected _timer: number | null;
  /**
   * The text message to be shown on the statusbar
   */
  protected _message: string;

  protected _changed = new Emitter<void>();

  protected _isDisposed = false;

  constructor() {
    this._message = '';
    this._timer = null;
  }

  /**
   * Signal emitted on status changed event.
   */
  get changed(): Emitter<void> {
    return this._changed;
  }

  /**
   * Test whether the object is disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Dispose the object.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._isDisposed = true;
    if (this._timer) {
      window.clearTimeout(this._timer);
    }
  }

  /**
   * The text message to be shown on the statusbar.
   */
  get message(): string {
    return this._message;
  }

  /**
   * Set the text message and (optionally) the timeout to remove it.
   * @param message
   * @param timeout - number of ms to until the message is cleaned;
   *        -1 if the message should stay up indefinitely;
   *        defaults to 3000ms (3 seconds)
   */
  set(message: string, timeout: number = 1000 * 3): void {
    this._expireTimer();
    this._message = message;
    this._changed.fire();
    if (timeout !== -1) {
      this._timer = window.setTimeout(this.clear.bind(this), timeout);
    }
  }

  /**
   * Clear the status message.
   */
  clear(): void {
    this._message = '';
    this._changed.fire();
  }

  /**
   * Clear the previous `setTimeout` call.
   */
  protected _expireTimer(): void {
    if (this._timer !== null) {
      window.clearTimeout(this._timer);
      this._timer = null;
    }
  }
}
