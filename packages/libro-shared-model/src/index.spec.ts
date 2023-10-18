import assert from 'assert';

import { YNotebook, createMutex } from './index.js';
import 'reflect-metadata';

describe('libro-shared-model', () => {
  it('#import', () => {
    assert(YNotebook);
    assert(createMutex);
  });
});
