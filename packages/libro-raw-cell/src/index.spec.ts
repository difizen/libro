import 'reflect-metadata';
import assert from 'assert';

import { RawCellModule } from './index.js';

describe('libro-raw-cell', () => {
  it('#import', () => {
    assert(RawCellModule);
  });
});
