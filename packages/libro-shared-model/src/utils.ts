import type * as Y from 'yjs';

import type * as models from './api.js';

export function convertYMapEventToMapChange(
  yMapEvent: Y.YMapEvent<any>,
): models.MapChange {
  const changes = new Map();
  yMapEvent.changes.keys.forEach((event, key) => {
    changes.set(key, {
      action: event.action,
      oldValue: event.oldValue,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      newValue: this.ymeta.get(key),
    });
  });
  return changes;
}

/**
 * Creates a mutual exclude function with the following property:
 *
 * ```js
 * const mutex = createMutex()
 * mutex(() => {
 *   // This function is immediately executed
 *   mutex(() => {
 *     // This function is not executed, as the mutex is already active.
 *   })
 * })
 * ```
 */
export const createMutex = (): ((f: () => void) => void) => {
  let token = true;
  return (f: any): void => {
    if (token) {
      token = false;
      try {
        f();
      } finally {
        token = true;
      }
    }
  };
};
