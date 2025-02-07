import type { MaybePromise } from '@difizen/mana-common';

export const StorageService = Symbol('StorageService');

/**
 * The storage service provides an interface to some data storage that allows extensions to keep state among sessions.
 */
export type StorageService = {
  /**
   * Stores the given data under the given key.
   */
  setData: <T>(key: string, data: T) => MaybePromise<void>;

  /**
   * Returns the data stored for the given key or the provided default value if nothing is stored for the given key.
   */
  getData: (<T>(key: string, defaultValue: T) => MaybePromise<T>) &
    (<T>(key: string) => MaybePromise<T | undefined>);
};

export type LocalStorage = {
  removeItem?: (key: string) => void;
  clear?: () => void;
  [key: string]: any;
};
