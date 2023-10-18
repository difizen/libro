import assert from 'assert';

import { LibroSearchManager, LibroSearchView } from './index.js';
import 'reflect-metadata';

describe('libro-search', () => {
  it('#import', () => {
    assert(LibroSearchManager);
    assert(LibroSearchView);
  });
});
