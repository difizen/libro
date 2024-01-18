import type {
  CodeEditorFactory,
  EditorState,
  EditorStateFactory,
  IEditorOptions,
} from '@difizen/libro-code-editor';

import { codeMirrorDefaultConfig, CodeMirrorEditor } from './editor.js';

export const codeMirrorEditorFactory: CodeEditorFactory = (
  options: IEditorOptions,
  state?: EditorState,
) => {
  return new CodeMirrorEditor({
    ...options,
    config: { ...codeMirrorDefaultConfig, ...options.config },
    state,
  });
};

export const stateFactory: EditorStateFactory = () => {
  return {
    toJSON: () => {
      return {};
    },
    dispose: () => {
      //
    },
    state: {},
  };
};
