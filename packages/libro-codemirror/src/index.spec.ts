import 'reflect-metadata';
import assert from 'assert';

import { CodeMirrorEditor, codeMirrorEditorFactory } from './index.js';

describe('libro-codemirror', () => {
  it('#import', () => {
    assert(CodeMirrorEditor);
    assert(codeMirrorEditorFactory);
  });
});
