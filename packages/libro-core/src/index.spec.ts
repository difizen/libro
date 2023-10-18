import assert from 'assert';

import { LibroService, LibroView, LibroCellService } from './index.js';
import 'reflect-metadata';

describe('libro-core', () => {
  it('#import', () => {
    assert(LibroService);
    assert(LibroView);
    assert(LibroCellService);
  });
});
