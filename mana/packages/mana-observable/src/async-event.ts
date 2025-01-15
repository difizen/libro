import type { Disposable, Event } from '@difizen/mana-common';
import { Emitter, noop } from '@difizen/mana-common';
import { CallbackList } from '@difizen/mana-common';

type Callback = (...args: any[]) => any;

export class AsyncCallbackList extends CallbackList {
  protected called: Callback[] | undefined = undefined;

  public override invoke(...args: any[]): any[] {
    const ret: any[] = [];
    if (!this._callbacks) {
      return [];
    }
    if (!this.called) {
      this.called = [];
    }
    const callbacks = this._callbacks?.slice(0);
    for (const [callback, ctx] of callbacks) {
      try {
        let promise;
        if (!this.called.includes(callback)) {
          this.called.push(callback);
          promise = Promise.resolve().then(() => {
            callback.apply(ctx, args);
            this.called = undefined;
            return;
          });
        }
        ret.push(promise);
      } catch (e) {
        console.error(e);
      }
    }
    return ret;
  }
}

export type EmitterOptions = {
  onFirstListenerAdd?: (ctx: any) => void;
  onLastListenerRemove?: (ctx: any) => void;
};

export class AsyncEmitter<T = any> extends Emitter {
  protected _asyncCallbacks: CallbackList | undefined;
  protected _eventAsync?: Event<T>;

  /**
   * For the public to allow to subscribe
   * to events from this Emitter
   */
  get eventAsync(): Event<T> {
    if (!this._eventAsync) {
      this._eventAsync = (listener: (e: T) => any, context?: any) => {
        const callbacks = () => {
          if (!this._asyncCallbacks) {
            this._asyncCallbacks = new AsyncCallbackList();
          }
          return this._asyncCallbacks;
        };
        const callbackList = callbacks();
        if (
          this._options &&
          this._options.onFirstListenerAdd &&
          callbackList.isEmpty()
        ) {
          this._options.onFirstListenerAdd(this);
        }
        callbackList.add(listener, context);

        const result: Disposable = {
          dispose: () => {
            result.dispose = noop;
            if (!this._disposed) {
              callbacks().remove(listener, context);
              result.dispose = noop;
              if (
                this._options &&
                this._options.onLastListenerRemove &&
                callbacks().isEmpty()
              ) {
                this._options.onLastListenerRemove(this);
              }
            }
          },
        };
        return result;
      };
    }
    return this._eventAsync;
  }

  /**
   * fire an event to subscribers
   */
  override fire(event: T): any {
    super.fire(event);
    if (this._asyncCallbacks) {
      this._asyncCallbacks.invoke(event);
    }
  }

  override dispose(): void {
    if (this._asyncCallbacks) {
      this._asyncCallbacks.dispose();
      this._asyncCallbacks = undefined;
    }
    super.dispose();
  }
}
