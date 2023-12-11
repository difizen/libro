import * as monaco from '@difizen/monaco-editor-core';

export default monaco;
export const { Emitter, MarkerSeverity, Range, Uri, editor, languages } = monaco || {};
