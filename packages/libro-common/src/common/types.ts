export type Mutable<T> = { -readonly [P in keyof T]: T[P] };
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer I)[]
    ? RecursivePartial<I>[]
    : RecursivePartial<T[P]>;
};
export type MaybeArray<T> = T | T[];
export type MaybePromise<T> = T | PromiseLike<T>;
export type Newable<T> = new (...args: any[]) => T;
export type Abstract<T> = {
  prototype: T;
};

export function toArray<T>(v: MaybeArray<T>): T[] {
  if (Array.isArray(v)) {
    return v;
  }
  return [v];
}

export function isPromise(obj: any): obj is Promise<any> {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}
export function isPromiseLike<T>(obj: MaybePromise<T>): obj is PromiseLike<T> {
  return isPromise(obj);
}
