import assert from 'assert';

import {
  CodemirrorCellSearchProvider,
  CodeMirrorCodeCellSearchProvider,
} from './index.js';
import 'reflect-metadata';

describe('libro-search-codemirror-cell', () => {
  it('#import', () => {
    assert(CodemirrorCellSearchProvider);
    assert(CodeMirrorCodeCellSearchProvider);
  });
});
