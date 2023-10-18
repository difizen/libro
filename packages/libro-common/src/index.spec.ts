import assert from 'assert';

import { defaultSanitizer, concatMultilineString, Poll } from './index.js';
import 'reflect-metadata';

describe('libro-common', () => {
  it('#import', () => {
    assert(defaultSanitizer);
    assert(concatMultilineString);
    assert(Poll);
  });
});
