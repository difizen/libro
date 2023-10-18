import assert from 'assert';

import { MarkdownRender } from './index.js';
import 'reflect-metadata';

describe('libro-markdown', () => {
  it('#import', () => {
    assert(MarkdownRender);
  });
});
