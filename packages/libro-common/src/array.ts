/**
 * Find the index of the first occurrence of a value in an array.
 *
 * @param array - The array-like object to search.
 *
 * @param value - The value to locate in the array. Values are
 *   compared using strict `===` equality.
 *
 * @param start - The index of the first element in the range to be
 *   searched, inclusive. The default value is `0`. Negative values
 *   are taken as an offset from the end of the array.
 *
 * @param stop - The index of the last element in the range to be
 *   searched, inclusive. The default value is `-1`. Negative values
 *   are taken as an offset from the end of the array.
 *
 * @returns The index of the first occurrence of the value, or `-1`
 *   if the value is not found.
 *
 * #### Notes
 * If `stop < start` the search will wrap at the end of the array.
 *
 * #### Complexity
 * Linear.
 *
 * #### Undefined Behavior
 * A `start` or `stop` which is non-integral.
 *
 * #### Example
 * ```typescript
 *
 * let data = ['one', 'two', 'three', 'four', 'one'];
 * firstIndexOfArray(data, 'red');        // -1
 * firstIndexOfArray(data, 'one');        // 0
 * firstIndexOfArray(data, 'one', 1);     // 4
 * firstIndexOfArray(data, 'two', 2);     // -1
 * firstIndexOfArray(data, 'two', 2, 1);  // 1
 * ```
 */
export function firstIndexOfArray<T>(
  array: ArrayLike<T>,
  value: T,
  start = 0,
  stop = -1,
): number {
  const n = array.length;
  let arrStart = start;
  let arrStop = stop;
  if (n === 0) {
    return -1;
  }
  if (arrStart < 0) {
    arrStart = Math.max(0, arrStart + n);
  } else {
    arrStart = Math.min(arrStart, n - 1);
  }
  if (arrStop < 0) {
    arrStop = Math.max(0, arrStop + n);
  } else {
    arrStop = Math.min(arrStop, n - 1);
  }
  let span: number;
  if (arrStop < arrStart) {
    span = arrStop + 1 + (n - arrStart);
  } else {
    span = arrStop - arrStart + 1;
  }
  for (let i = 0; i < span; ++i) {
    const j = (arrStart + i) % n;
    if (array[j] === value) {
      return j;
    }
  }
  return -1;
}

/**
 * Find the index of the first value which matches a predicate.
 *
 * @param array - The array-like object to search.
 *
 * @param fn - The predicate function to apply to the values.
 *
 * @param start - The index of the first element in the range to be
 *   searched, inclusive. The default value is `0`. Negative values
 *   are taken as an offset from the end of the array.
 *
 * @param stop - The index of the last element in the range to be
 *   searched, inclusive. The default value is `-1`. Negative values
 *   are taken as an offset from the end of the array.
 *
 * @returns The index of the first matching value, or `-1` if no
 *   matching value is found.
 *
 * #### Notes
 * If `stop < start` the search will wrap at the end of the array.
 *
 * #### Complexity
 * Linear.
 *
 * #### Undefined Behavior
 * A `start` or `stop` which is non-integral.
 *
 * Modifying the length of the array while searching.
 *
 * #### Example
 * ```typescript
 *
 * function isEven(value: number): boolean {
 *   return value % 2 === 0;
 * }
 *
 * let data = [1, 2, 3, 4, 3, 2, 1];
 * findFirstArrayIndex(data, isEven);       // 1
 * findFirstArrayIndex(data, isEven, 4);    // 5
 * findFirstArrayIndex(data, isEven, 6);    // -1
 * findFirstArrayIndex(data, isEven, 6, 5); // 1
 * ```
 */
export function findFirstArrayIndex<T>(
  array: ArrayLike<T>,
  fn: (value: T, index: number) => boolean,
  start = 0,
  stop = -1,
): number {
  const n = array.length;
  let arrStart = start;
  let arrStop = stop;
  if (n === 0) {
    return -1;
  }
  if (arrStart < 0) {
    arrStart = Math.max(0, arrStart + n);
  } else {
    arrStart = Math.min(arrStart, n - 1);
  }
  if (arrStop < 0) {
    arrStop = Math.max(0, arrStop + n);
  } else {
    arrStop = Math.min(arrStop, n - 1);
  }
  let span: number;
  if (arrStop < arrStart) {
    span = arrStop + 1 + (n - arrStart);
  } else {
    span = arrStop - arrStart + 1;
  }
  for (let i = 0; i < span; ++i) {
    const j = (arrStart + i) % n;
    if (fn(array[j], j)) {
      return j;
    }
  }
  return -1;
}

/**
 * Find the index of the last value which matches a predicate.
 *
 * @param object - The array-like object to search.
 *
 * @param fn - The predicate function to apply to the values.
 *
 * @param start - The index of the first element in the range to be
 *   searched, inclusive. The default value is `-1`. Negative values
 *   are taken as an offset from the end of the array.
 *
 * @param stop - The index of the last element in the range to be
 *   searched, inclusive. The default value is `0`. Negative values
 *   are taken as an offset from the end of the array.
 *
 * @returns The index of the last matching value, or `-1` if no
 *   matching value is found.
 *
 * #### Notes
 * If `start < stop` the search will wrap at the front of the array.
 *
 * #### Complexity
 * Linear.
 *
 * #### Undefined Behavior
 * A `start` or `stop` which is non-integral.
 *
 * Modifying the length of the array while searching.
 *
 * #### Example
 * ```typescript
 *
 * function isEven(value: number): boolean {
 *   return value % 2 === 0;
 * }
 *
 * let data = [1, 2, 3, 4, 3, 2, 1];
 * findLastArrayIndex(data, isEven);        // 5
 * findLastArrayIndex(data, isEven, 4);     // 3
 * findLastArrayIndex(data, isEven, 0);     // -1
 * findLastArrayIndex(data, isEven, 0, 1);  // 5
 * ```
 */
export function findLastArrayIndex<T>(
  array: ArrayLike<T>,
  fn: (value: T, index: number) => boolean,
  start = -1,
  stop = 0,
): number {
  let arrStart = start;
  let arrStop = stop;

  const n = array.length;
  if (n === 0) {
    return -1;
  }
  if (arrStart < 0) {
    arrStart = Math.max(0, arrStart + n);
  } else {
    arrStart = Math.min(arrStart, n - 1);
  }
  if (arrStop < 0) {
    arrStop = Math.max(0, arrStop + n);
  } else {
    arrStop = Math.min(arrStop, n - 1);
  }
  let d: number;
  if (arrStart < arrStop) {
    d = arrStart + 1 + (n - arrStop);
  } else {
    d = arrStart - arrStop + 1;
  }
  for (let i = 0; i < d; ++i) {
    const j = (arrStart - i + n) % n;
    if (fn(array[j], j)) {
      return j;
    }
  }
  return -1;
}

/**
 * Find the first value which matches a predicate.
 *
 * @param array - The array-like object to search.
 *
 * @param fn - The predicate function to apply to the values.
 *
 * @param start - The index of the first element in the range to be
 *   searched, inclusive. The default value is `0`. Negative values
 *   are taken as an offset from the end of the array.
 *
 * @param stop - The index of the last element in the range to be
 *   searched, inclusive. The default value is `-1`. Negative values
 *   are taken as an offset from the end of the array.
 *
 * @returns The first matching value, or `undefined` if no matching
 *   value is found.
 *
 * #### Notes
 * If `stop < start` the search will wrap at the end of the array.
 *
 * #### Complexity
 * Linear.
 *
 * #### Undefined Behavior
 * A `start` or `stop` which is non-integral.
 *
 * Modifying the length of the array while searching.
 *
 * #### Example
 * ```typescript
 *
 * function isEven(value: number): boolean {
 *   return value % 2 === 0;
 * }
 *
 * let data = [1, 2, 3, 4, 3, 2, 1];
 * findFirstArrayValue(data, isEven);       // 2
 * findFirstArrayValue(data, isEven, 2);    // 4
 * findFirstArrayValue(data, isEven, 6);    // undefined
 * findFirstArrayValue(data, isEven, 6, 5); // 2
 * ```
 */
export function findFirstArrayValue<T>(
  array: ArrayLike<T>,
  fn: (value: T, index: number) => boolean,
  start = 0,
  stop = -1,
): T | undefined {
  const index = findFirstArrayIndex(array, fn, start, stop);
  return index !== -1 ? array[index] : undefined;
}

/**
 * Find the last value which matches a predicate.
 *
 * @param object - The array-like object to search.
 *
 * @param fn - The predicate function to apply to the values.
 *
 * @param start - The index of the first element in the range to be
 *   searched, inclusive. The default value is `-1`. Negative values
 *   are taken as an offset from the end of the array.
 *
 * @param stop - The index of the last element in the range to be
 *   searched, inclusive. The default value is `0`. Negative values
 *   are taken as an offset from the end of the array.
 *
 * @returns The last matching value, or `undefined` if no matching
 *   value is found.
 *
 * #### Notes
 * If `start < stop` the search will wrap at the front of the array.
 *
 * #### Complexity
 * Linear.
 *
 * #### Undefined Behavior
 * A `start` or `stop` which is non-integral.
 *
 * Modifying the length of the array while searching.
 *
 * #### Example
 * ```typescript
 *
 * function isEven(value: number): boolean {
 *   return value % 2 === 0;
 * }
 *
 * let data = [1, 2, 3, 4, 3, 2, 1];
 * findLastArrayValue(data, isEven);        // 2
 * findLastArrayValue(data, isEven, 4);     // 4
 * findLastArrayValue(data, isEven, 0);     // undefined
 * findLastArrayValue(data, isEven, 0, 1);  // 2
 * ```
 */
export function findLastArrayValue<T>(
  array: ArrayLike<T>,
  fn: (value: T, index: number) => boolean,
  start = -1,
  stop = 0,
): T | undefined {
  const index = findLastArrayIndex(array, fn, start, stop);
  return index !== -1 ? array[index] : undefined;
}

/**
 * Find the index of the first element which compares `>=` to a value.
 *
 * @param array - The sorted array-like object to search.
 *
 * @param value - The value to locate in the array.
 *
 * @param fn - The 3-way comparison function to apply to the values.
 *   It should return `< 0` if an element is less than a value, `0` if
 *   an element is equal to a value, or `> 0` if an element is greater
 *   than a value.
 *
 * @param start - The index of the first element in the range to be
 *   searched, inclusive. The default value is `0`. Negative values
 *   are taken as an offset from the end of the array.
 *
 * @param stop - The index of the last element in the range to be
 *   searched, inclusive. The default value is `-1`. Negative values
 *   are taken as an offset from the end of the array.
 *
 * @returns The index of the first element which compares `>=` to the
 *   value, or `length` if there is no such element. If the computed
 *   index for `stop` is less than `start`, then the computed index
 *   for `start` is returned.
 *
 * #### Notes
 * The array must already be sorted in ascending order according to
 * the comparison function.
 *
 * #### Complexity
 * Logarithmic.
 *
 * #### Undefined Behavior
 * Searching a range which is not sorted in ascending order.
 *
 * A `start` or `stop` which is non-integral.
 *
 * Modifying the length of the array while searching.
 *
 * #### Example
 * ```typescript
 *
 * function numberCmp(a: number, b: number): number {
 *   return a - b;
 * }
 *
 * let data = [0, 3, 4, 7, 7, 9];
 * lowerArrayBound(data, 0, numberCmp);   // 0
 * lowerArrayBound(data, 6, numberCmp);   // 3
 * lowerArrayBound(data, 7, numberCmp);   // 3
 * lowerArrayBound(data, -1, numberCmp);  // 0
 * lowerArrayBound(data, 10, numberCmp);  // 6
 * ```
 */
export function lowerArrayBound<T, U>(
  array: ArrayLike<T>,
  value: U,
  fn: (element: T, value: U) => number,
  start = 0,
  stop = -1,
): number {
  let arrStart = start;
  let arrStop = stop;
  const n = array.length;
  if (n === 0) {
    return 0;
  }
  if (arrStart < 0) {
    arrStart = Math.max(0, arrStart + n);
  } else {
    arrStart = Math.min(arrStart, n - 1);
  }
  if (arrStop < 0) {
    arrStop = Math.max(0, arrStop + n);
  } else {
    arrStop = Math.min(arrStop, n - 1);
  }
  let begin = arrStart;
  let span = arrStop - arrStart + 1;
  while (span > 0) {
    const half = span >> 1;
    const middle = begin + half;
    if (fn(array[middle], value) < 0) {
      begin = middle + 1;
      span -= half + 1;
    } else {
      span = half;
    }
  }
  return begin;
}

/**
 * Find the index of the first element which compares `>` than a value.
 *
 * @param array - The sorted array-like object to search.
 *
 * @param value - The value to locate in the array.
 *
 * @param fn - The 3-way comparison function to apply to the values.
 *   It should return `< 0` if an element is less than a value, `0` if
 *   an element is equal to a value, or `> 0` if an element is greater
 *   than a value.
 *
 * @param start - The index of the first element in the range to be
 *   searched, inclusive. The default value is `0`. Negative values
 *   are taken as an offset from the end of the array.
 *
 * @param stop - The index of the last element in the range to be
 *   searched, inclusive. The default value is `-1`. Negative values
 *   are taken as an offset from the end of the array.
 *
 * @returns The index of the first element which compares `>` than the
 *   value, or `length` if there is no such element. If the computed
 *   index for `stop` is less than `start`, then the computed index
 *   for `start` is returned.
 *
 * #### Notes
 * The array must already be sorted in ascending order according to
 * the comparison function.
 *
 * #### Complexity
 * Logarithmic.
 *
 * #### Undefined Behavior
 * Searching a range which is not sorted in ascending order.
 *
 * A `start` or `stop` which is non-integral.
 *
 * Modifying the length of the array while searching.
 *
 * #### Example
 * ```typescript
 *
 * function numberCmp(a: number, b: number): number {
 *   return a - b;
 * }
 *
 * let data = [0, 3, 4, 7, 7, 9];
 * upperArrayBound(data, 0, numberCmp);   // 1
 * upperArrayBound(data, 6, numberCmp);   // 3
 * upperArrayBound(data, 7, numberCmp);   // 5
 * upperArrayBound(data, -1, numberCmp);  // 0
 * upperArrayBound(data, 10, numberCmp);  // 6
 * ```
 */
export function upperArrayBound<T, U>(
  array: ArrayLike<T>,
  value: U,
  fn: (element: T, value: U) => number,
  start = 0,
  stop = -1,
): number {
  const n = array.length;
  let arrStart = start;
  let arrStop = stop;
  if (n === 0) {
    return 0;
  }
  if (arrStart < 0) {
    arrStart = Math.max(0, arrStart + n);
  } else {
    arrStart = Math.min(arrStart, n - 1);
  }
  if (arrStop < 0) {
    arrStop = Math.max(0, arrStop + n);
  } else {
    arrStop = Math.min(arrStop, n - 1);
  }
  let begin = arrStart;
  let span = arrStop - arrStart + 1;
  while (span > 0) {
    const half = span >> 1;
    const middle = begin + half;
    if (fn(array[middle], value) > 0) {
      span = half;
    } else {
      begin = middle + 1;
      span -= half + 1;
    }
  }
  return begin;
}

/**
 * Remove all occurrences of values which match a predicate.
 *
 * @param array - The array of interest.
 *
 * @param fn - The predicate function to apply to the values.
 *
 * @param start - The index of the first element in the range to be
 *   searched, inclusive. The default value is `0`. Negative values
 *   are taken as an offset from the end of the array.
 *
 * @param stop - The index of the last element in the range to be
 *   searched, inclusive. The default value is `-1`. Negative values
 *   are taken as an offset from the end of the array.
 *
 * @returns The number of elements removed from the array.
 *
 * #### Notes
 * If `stop < start` the search will conceptually wrap at the end of
 * the array, however the array will be traversed front-to-back.
 *
 * #### Complexity
 * Linear.
 *
 * #### Example
 * ```typescript
 *
 * function isEven(value: number): boolean {
 *   return value % 2 === 0;
 * }
 *
 * function isNegative(value: number): boolean {
 *   return value < 0;
 * }
 *
 * let data = [0, 12, -13, -9, 23, 39, 14, -15, 12, 75];
 * removeAllWhereFromArray(data, isEven);            // 4
 * removeAllWhereFromArray(data, isNegative, 0, 3);  // 2
 * ```
 */
export function removeAllWhereFromArray<T>(
  array: T[],
  fn: (value: T, index: number) => boolean,
  start = 0,
  stop = -1,
): number {
  const n = array.length;
  let arrStart = start;
  let arrStop = stop;
  if (n === 0) {
    return 0;
  }
  if (arrStart < 0) {
    arrStart = Math.max(0, arrStart + n);
  } else {
    arrStart = Math.min(arrStart, n - 1);
  }
  if (arrStop < 0) {
    arrStop = Math.max(0, arrStop + n);
  } else {
    arrStop = Math.min(arrStop, n - 1);
  }
  let count = 0;
  for (let i = 0; i < n; ++i) {
    if (arrStart <= arrStop && i >= arrStart && i <= arrStop && fn(array[i], i)) {
      count++;
    } else if (
      arrStop < arrStart &&
      (i <= arrStop || i >= arrStart) &&
      fn(array[i], i)
    ) {
      count++;
    } else if (count > 0) {
      array[i - count] = array[i];
    }
  }
  if (count > 0) {
    array.length = n - count;
  }
  return count;
}
