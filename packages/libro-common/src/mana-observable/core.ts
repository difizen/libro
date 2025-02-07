import type { Abstract, Newable } from '@difizen/mana-common';

/* eslint-disable @typescript-eslint/no-explicit-any */
export namespace ObservableSymbol {
  export const Tracker = Symbol('Tracker');
  export const Notifier = Symbol('Notifier');
  export const Observable = Symbol('Observable');
  export const ObservableProperties = Symbol('ObservableProperties');
  export const KeepOrigin = Symbol('KeepOrigin');
  export const Self = Symbol('Self');
}

export type Notify = (target?: any, prop?: any) => void;

export namespace Observable {
  export type Container = {
    get: <T>(identifier: Token<T>) => T;
    createChild: () => Container;
  };
  export type Token<T> = string | symbol | Newable<T> | Abstract<T>;
  export type ContainerContext = {
    getContainer: () => Container | undefined;
  };
}

export interface Traceable<T = any> {
  [ObservableSymbol.Self]: T;
}
