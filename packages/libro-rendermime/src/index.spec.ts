import assert from 'assert';

import { RenderMimeRegistry, renderHTML } from './index.js';
import 'reflect-metadata';

describe('libro-rendermime', () => {
  it('#import', () => {
    assert(RenderMimeRegistry);
    assert(renderHTML);
  });
});
