import 'reflect-metadata';
import assert from 'assert';

import { CodeCellModule } from './index.js';

describe('libro-code-cell', () => {
  it('#import', () => {
    assert(CodeCellModule);
  });
});
