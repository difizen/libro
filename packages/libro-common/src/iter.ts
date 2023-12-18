/**
 * An object which can produce an iterator over its values.
 */
export interface IIterable<T> {
  /**
   * Get an iterator over the object's values.
   *
   * @returns An iterator which yields the object's values.
   *
   * #### Notes
   * Depending on the iterable, the returned iterator may or may not be
   * a new object. A collection or other container-like object should
   * typically return a new iterator, while an iterator itself should
   * normally return `this`.
   */
  iter: () => IIterator<T>;
}

/**
 * An object which traverses a collection of values.
 *
 * #### Notes
 * An `IIterator` is itself an `IIterable`. Most implementations of
 * `IIterator` should simply return `this` from the `iter()` method.
 */
export interface IIterator<T> extends IIterable<T> {
  /**
   * Create an independent clone of the iterator.
   *
   * @returns A new independent clone of the iterator.
   *
   * #### Notes
   * The cloned iterator can be consumed independently of the current
   * iterator. In essence, it is a copy of the iterator value stream
   * which starts at the current location.
   *
   * This can be useful for lookahead and stream duplication.
   */
  clone: () => IIterator<T>;

  /**
   * Get the next value from the iterator.
   *
   * @returns The next value from the iterator, or `undefined`.
   *
   * #### Notes
   * The `undefined` value is used to signal the end of iteration and
   * should therefore not be used as a value in a collection.
   *
   * The use of the `undefined` sentinel is an explicit design choice
   * which favors performance over purity. The ES6 iterator design of
   * returning a `{ value, done }` pair is suboptimal, as it requires
   * an object allocation on each iteration; and an `isDone()` method
   * would increase implementation and runtime complexity.
   */
  next: () => T | undefined;
}

/**
 * A type alias for an iterable or builtin array-like object.
 */
export type IterableOrArrayLike<T> = IIterable<T> | ArrayLike<T>;

/**
 * An iterator for an array-like object.
 *
 * #### Notes
 * This iterator can be used for any builtin JS array-like object.
 */
export class ArrayIterator<T> implements IIterator<T> {
  /**
   * Construct a new array iterator.
   *
   * @param source - The array-like object of interest.
   */
  constructor(source: ArrayLike<T>) {
    this._source = source;
  }

  /**
   * Get an iterator over the object's values.
   *
   * @returns An iterator which yields the object's values.
   */
  iter(): IIterator<T> {
    return this;
  }

  /**
   * Create an independent clone of the iterator.
   *
   * @returns A new independent clone of the iterator.
   */
  clone(): IIterator<T> {
    const result = new ArrayIterator<T>(this._source);
    result._index = this._index;
    return result;
  }

  /**
   * Get the next value from the iterator.
   *
   * @returns The next value from the iterator, or `undefined`.
   */
  next(): T | undefined {
    if (this._index >= this._source.length) {
      return undefined;
    }
    return this._source[this._index++];
  }

  protected _index = 0;
  protected _source: ArrayLike<T>;
}

/**
 * Create an iterator for an iterable object.
 *
 * @param object - The iterable or array-like object of interest.
 *
 * @returns A new iterator for the given object.
 *
 * #### Notes
 * This function allows iteration algorithms to operate on user-defined
 * iterable types and builtin array-like objects in a uniform fashion.
 */
export function iter<T>(object: IterableOrArrayLike<T>): IIterator<T> {
  let it: IIterator<T>;
  if (typeof (object as any).iter === 'function') {
    it = (object as IIterable<T>).iter();
  } else {
    it = new ArrayIterator<T>(object as ArrayLike<T>);
  }
  return it;
}

/**
 * Invoke a function for each value in an iterable.
 *
 * @param object - The iterable or array-like object of interest.
 *
 * @param fn - The callback function to invoke for each value.
 *
 * #### Notes
 * Iteration can be terminated early by returning `false` from the
 * callback function.
 *
 * #### Complexity
 * Linear.
 *
 * #### Example
 * ```typescript
 *
 * let data = [5, 7, 0, -2, 9];
 *
 * each(data, value => { console.log(value); });
 * ```
 */
export function each<T>(
  object: IterableOrArrayLike<T>,
  fn: (value: T, index: number) => boolean | void,
): void {
  let index = 0;
  const it = iter(object);
  let value: T | undefined;
  while ((value = it.next()) !== undefined) {
    if (fn(value, index++) === false) {
      return;
    }
  }
}

/**
 * Create an array from an iterable of values.
 *
 * @param object - The iterable or array-like object of interest.
 *
 * @returns A new array of values from the given object.
 *
 * #### Example
 * ```typescript
 *
 * let data = [1, 2, 3, 4, 5, 6];
 *
 * let stream = iter(data);
 *
 * toArray(stream);  // [1, 2, 3, 4, 5, 6];
 * ```
 */
export function toArray<T>(object: IterableOrArrayLike<T>): T[] {
  let index = 0;
  const result: T[] = [];
  const it = iter(object);
  let value: T | undefined;
  while ((value = it.next()) !== undefined) {
    result[index++] = value;
  }
  return result;
}
