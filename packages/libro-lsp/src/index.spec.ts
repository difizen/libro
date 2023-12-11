import 'reflect-metadata';
import assert from 'assert';

import { LibroLSPModule } from './index.js';

describe('libro-lsp', () => {
  it('#import', () => {
    assert(LibroLSPModule);
  });
});
