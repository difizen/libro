import assert from 'assert';

import { MarkdownCell, MarkdownCellView } from './index.js';
import 'reflect-metadata';

describe('libro-codemirror-markdown-cell', () => {
  it('#import', () => {
    assert(MarkdownCell);
    assert(MarkdownCellView);
  });
});
