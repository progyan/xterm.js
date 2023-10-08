/**
 * Copyright (c) 2022 The xterm.js authors. All rights reserved.
 * @license MIT
 */

// Work variables to avoid garbage collection.
let i = 0;

/**
 * A generic list that is maintained in sorted order and allows values with duplicate keys. This
 * list is based on binary search and as such locating a key will take O(log n) amortized, this
 * includes the by key iterator.
 */
export class SortedList<T> {
  private readonly _array: T[] = [];

  constructor(
    private readonly _getKey: (value: T) => number
  ) {
  }

  public clear(): void {
    this._array.length = 0;
  }

  public insert(value: T): void {
    if (this._array.length === 0) {
      this._array.push(value);
      return;
    }
    i = this._search(this._getKey(value));
    this._array.splice(i, 0, value);
  }

  public delete(value: T): boolean {
    if (this._array.length === 0) {
      return false;
    }
    const key = this._getKey(value);
    if (key === undefined) {
      return false;
    }
    i = this._search(key);
    if (i === -1) {
      return false;
    }
    if (this._getKey(this._array[i]) !== key) {
      return false;
    }
    do {
      if (this._array[i] === value) {
        this._array.splice(i, 1);
        return true;
      }
    } while (++i < this._array.length && this._getKey(this._array[i]) === key);
    return false;
  }

  public *getKeyIterator(key: number): IterableIterator<T> {
    if (this._array.length === 0) {
      return;
    }
    i = this._search(key);
    if (i < 0 || i >= this._array.length) {
      return;
    }
    if (this._getKey(this._array[i]) !== key) {
      return;
    }
    do {
      yield this._array[i];
    } while (++i < this._array.length && this._getKey(this._array[i]) === key);
  }

  public forEachByKey(key: number, callback: (value: T) => void): void {
    if (this._array.length === 0) {
      return;
    }
    i = this._search(key);
    if (i < 0 || i >= this._array.length) {
      return;
    }
    if (this._getKey(this._array[i]) !== key) {
      return;
    }
    do {
      callback(this._array[i]);
    } while (++i < this._array.length && this._getKey(this._array[i]) === key);
  }

  public values(): IterableIterator<T> {
    // Duplicate the array to avoid issues when _array changes while iterating
    return [...this._array].values();
  }

  private _search(key: number): number {
    let min = -1;
    let max = this._array.length;
    while (max - min > 1) {
      const mid = (min + max) >> 1;
      const midKey = this._getKey(this._array[mid]);
      if (midKey >= key) {
        max = mid;
      } else if (midKey < key) {
        min = mid;
      }
    }
    // return first element not less than key (also used as insert position)
    return max;
  }
}
