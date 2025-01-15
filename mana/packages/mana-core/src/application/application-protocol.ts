import type { Event } from '@difizen/mana-common';

/**
 * Service for opening new browser windows.
 */
export const WindowService = Symbol('WindowService');
export type WindowService = {
  /**
   * Called when the `window` is about to `unload` its resources.
   * At this point, the `document` is still visible and the [`BeforeUnloadEvent`](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event)
   * event will be canceled if the return value of this method is `false`.
   */
  canUnload: () => boolean;

  /**
   * Fires when the `window` unloads. The unload event is inevitable. On this event, the frontend application can save its state and release resource.
   * Saving the state and releasing any resources must be a synchronous call. Any asynchronous calls invoked after emitting this event might be ignored.
   */
  readonly onUnload: Event<void>;
};
