import 'reflect-metadata';
import assert from 'assert';

import { CodeEditorView, CodeEditorModule, defaultMimeType } from './index.js';

describe('libro-code-editor', () => {
  it('#import', () => {
    assert(CodeEditorView);
    assert(CodeEditorModule);
    assert(defaultMimeType);
  });
});
