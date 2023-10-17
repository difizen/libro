import type { CodeEditorFactory, IEditorOptions } from '@difizen/libro-code-editor';

import { codeMirrorDefaultConfig, CodeMirrorEditor } from './editor.js';

export const codeMirrorEditorFactory: CodeEditorFactory = (options: IEditorOptions) => {
  return new CodeMirrorEditor({
    ...options,
    config: { ...codeMirrorDefaultConfig, ...options.config },
  });
};
