import assert from 'assert';

import { LibroPromptCellView, LibroPromptCellModelFactory } from './index.js';
import 'reflect-metadata';

describe('libro-prompt-cell', () => {
  it('#import', () => {
    assert(LibroPromptCellView);
    assert(LibroPromptCellModelFactory);
  });
});
