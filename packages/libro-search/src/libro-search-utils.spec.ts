import 'reflect-metadata';
import assert from 'assert';
import { LibroSearchUtils } from './libro-search-utils.js';
import type { SearchMatch } from './libro-search-protocol.js';

describe('libro search utils', () => {
  it('#find next', () => {
    /**
     * 示例文本：1010011000111
     * 查找文本：0
     */
    const instance = new LibroSearchUtils();
    const matches: SearchMatch[] = [
      { position: 1, text: '0' }, // 0
      { position: 3, text: '0' }, // 1
      { position: 4, text: '0' }, // 2
      { position: 7, text: '0' }, // 3
      { position: 8, text: '0' }, // 4
      { position: 9, text: '0' }, // 5
    ];
    assert(instance.findNext(matches, 0) === 0);
    assert(instance.findNext(matches, 1) === 0);
    assert(instance.findNext(matches, 2) === 1);
    assert(instance.findNext(matches, 4) === 2);
    assert(instance.findNext(matches, 5) === 3);
    assert(instance.findNext(matches, 9) === 5);
    assert(instance.findNext(matches, 10) === undefined);
    assert(instance.findNext(matches, 5, 3) === 3);
  });
  it('#find next 0', () => {
    const instance = new LibroSearchUtils();
    const matches: SearchMatch[] = [
      { position: 7, text: '0' }, // 0
    ];
    assert(instance.findNext(matches, 0, 0, 0) === 0);
  });
});
