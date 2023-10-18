import assert from 'assert';

import {
  KernelConnection,
  ContentsManager,
  LibroKernelConnectionManager,
} from './index.js';
import 'reflect-metadata';

describe('libro-kernel', () => {
  it('#import', () => {
    assert(KernelConnection);
    assert(ContentsManager);
    assert(LibroKernelConnectionManager);
  });
});
