import assert from 'assert';

import { LibroCodeCellView, CodeCellModelFactory } from './index.js';
import 'reflect-metadata';

describe('libro-codemirror-code-cell', () => {
  it('#import', () => {
    assert(LibroCodeCellView);
    assert(CodeCellModelFactory);
  });
});
