import 'reflect-metadata';
import assert from 'assert';

import { MarkdownCellModule } from './index.js';

describe('libro-markdown-cell', () => {
  it('#import', () => {
    assert(MarkdownCellModule);
  });
});
