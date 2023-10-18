import assert from 'assert';

import {
  DisplayDataOutputModel,
  ErrorOutputModel,
  StreamOutputModel,
} from './index.js';
import 'reflect-metadata';

describe('libro-output', () => {
  it('#import', () => {
    assert(DisplayDataOutputModel);
    assert(ErrorOutputModel);
    assert(StreamOutputModel);
  });
});
