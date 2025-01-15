/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation and others. All rights reserved.
 *  Licensed under the MIT License. See https://github.com/Microsoft/vscode/blob/master/LICENSE.txt for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event, Emitter } from './event';

export type CancellationToken = {
  readonly isCancellationRequested: boolean;
  /*
   * An event emitted when cancellation is requested
   * @event
   */
  readonly onCancellationRequested: Event<void>;
};

const shortcutEvent: Event<void> = Object.freeze(function (
  callback: any,
  context?: any,
): any {
  const handle = setTimeout(callback.bind(context), 0);
  return {
    dispose(): void {
      clearTimeout(handle);
    },
  };
});

export namespace CancellationToken {
  export function is(thing: unknown): thing is CancellationToken {
    if (thing === CancellationToken.None || thing === CancellationToken.Cancelled) {
      return true;
    }
    if (thing instanceof MutableToken) {
      return true;
    }
    if (!thing || typeof thing !== 'object') {
      return false;
    }
    return (
      typeof (thing as CancellationToken).isCancellationRequested === 'boolean' &&
      typeof (thing as CancellationToken).onCancellationRequested === 'function'
    );
  }
  export const None: CancellationToken = Object.freeze({
    isCancellationRequested: false,
    onCancellationRequested: Event.None,
  });

  export const Cancelled: CancellationToken = Object.freeze({
    isCancellationRequested: true,
    onCancellationRequested: shortcutEvent,
  });
}

class MutableToken implements CancellationToken {
  private _isCancelled = false;
  private _emitter: Emitter<void> | undefined;

  public cancel(): void {
    if (!this._isCancelled) {
      this._isCancelled = true;
      if (this._emitter) {
        this._emitter.fire(undefined);
        this._emitter = undefined;
      }
    }
  }

  get isCancellationRequested(): boolean {
    return this._isCancelled;
  }

  get onCancellationRequested(): Event<void> {
    if (this._isCancelled) {
      return shortcutEvent;
    }
    if (!this._emitter) {
      this._emitter = new Emitter<void>();
    }
    return this._emitter.event;
  }

  public dispose(): void {
    if (this._emitter) {
      this._emitter.dispose();
    }
  }
}

export class CancellationTokenSource {
  private _token?: CancellationToken;

  get token(): CancellationToken {
    if (!this._token) {
      // be lazy and create the token only when
      // actually needed
      this._token = new MutableToken();
    }
    return this._token;
  }

  cancel(): void {
    if (!this._token) {
      // save an object by returning the default
      // cancelled token when cancellation happens
      // before someone asks for the token
      this._token = CancellationToken.Cancelled;
    } else if (this._token instanceof MutableToken) {
      // actually cancel
      this._token.cancel();
    }
  }

  dispose(cancel = false): void {
    if (cancel) {
      this.cancel();
    }
    if (!this._token) {
      // ensure to initialize with an empty token if we had none
      this._token = CancellationToken.None;
    } else if (this._token instanceof MutableToken) {
      // actually dispose
      this._token.dispose();
    }
  }
}

const cancelledMessage = 'Cancelled';

export function cancelled(): Error {
  return new Error(cancelledMessage);
}

export function isCancelled(err: Error | undefined): boolean {
  return !!err && err.message === cancelledMessage;
}

export function checkCancelled(token?: CancellationToken): void {
  if (!!token && token.isCancellationRequested) {
    throw cancelled();
  }
}
