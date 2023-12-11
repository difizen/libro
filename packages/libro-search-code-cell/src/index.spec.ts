import 'reflect-metadata';
import assert from 'assert';

import { SearchCodeCellModule } from './index.js';

describe('libro-search-code-cell', () => {
  it('#import', () => {
    assert(SearchCodeCellModule);
  });
});
