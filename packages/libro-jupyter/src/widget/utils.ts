import type { BufferJSON, Dict } from './protocol.js';

/**
 * Takes an object 'state' and fills in buffer[i] at 'path' buffer_paths[i]
 * where buffer_paths[i] is a list indicating where in the object buffer[i] should
 * be placed
 * Example: state = {a: 1, b: {}, c: [0, null]}
 * buffers = [array1, array2]
 * buffer_paths = [['b', 'data'], ['c', 1]]
 * Will lead to {a: 1, b: {data: array1}, c: [0, array2]}
 */
export function put_buffers(
  state: Dict<BufferJSON>,
  buffer_paths: (string | number)[][],
  buffers: (DataView | ArrayBuffer | ArrayBufferView | { buffer: ArrayBuffer })[],
): void {
  for (let i = 0; i < buffer_paths.length; i++) {
    const buffer_path = buffer_paths[i];
    // make sure the buffers are DataViews
    let buffer = buffers[i];
    if (!(buffer instanceof DataView)) {
      buffer = new DataView(buffer instanceof ArrayBuffer ? buffer : buffer.buffer);
    }
    // say we want to set state[x][y][z] = buffer
    let obj = state as any;
    // we first get obj = state[x][y]
    for (let j = 0; j < buffer_path.length - 1; j++) {
      obj = obj[buffer_path[j]];
    }
    // and then set: obj[z] = buffer
    obj[buffer_path[buffer_path.length - 1]] = buffer;
  }
}

/**
 * Creates a wrappable Promise rejection function.
 *
 * Creates a function that logs an error message before rethrowing
 * the original error that caused the promise to reject.
 */
export function reject(message: string, log: boolean) {
  return function promiseRejection(error: Error): never {
    if (log) {
      console.error(new Error(message));
    }
    throw error;
  };
}

/**
 * A polyfill for Object.assign
 *
 * This is from code that Typescript 2.4 generates for a polyfill.
 */
export const assign =
  (Object as any).assign ||
  function (t: any, ...args: any[]): any {
    for (let i = 1; i < args.length; i++) {
      const s = args[i];
      for (const p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) {
          t[p] = s[p];
        }
      }
    }
    return t;
  };
