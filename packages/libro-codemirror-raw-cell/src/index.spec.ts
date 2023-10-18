import assert from 'assert';

import { LibroRawCellView, LibroRawCellModel } from './index.js';
import 'reflect-metadata';

describe('libro-codemirror-raw-cell', () => {
  it('#import', () => {
    assert(LibroRawCellView);
    assert(LibroRawCellModel);
  });
});
