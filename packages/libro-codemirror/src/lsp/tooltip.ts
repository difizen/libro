import { hoverTooltip } from '@codemirror/view';

import type { CMLSPExtension } from './protocol.js';
import { offsetToPos, posToOffset, renderMarkupContent } from './util.js';

export const lspTooltip: CMLSPExtension = (options) => {
  return hoverTooltip(async (view, pos) => {
    if (!options.lspProvider) {
      return null;
    }

    const {
      lspConnection: connection,
      virtualDocument: doc,
      editor,
    } = await options.lspProvider();

    if (!connection.isReady || !connection.provides('hoverProvider')) {
      return null;
    }

    const { line, character } = offsetToPos(view.state.doc, pos);

    const virtualPos = doc.transformEditorToVirtual(editor, {
      line,
      ch: character,
      isEditor: true,
    });

    if (!virtualPos) {
      return null;
    }

    const result = await connection.clientRequests['textDocument/hover'].request({
      position: { line: virtualPos.line, character: virtualPos.ch },
      textDocument: {
        uri: doc.documentInfo.uri,
      },
    });
    if (!result) {
      return null;
    }
    const { contents, range } = result;
    let offset = posToOffset(view.state.doc, { line, character })!;
    let end;
    if (range) {
      const editorStart = doc.transformVirtualToEditor({
        line: range.start.line,
        ch: range.start.character,
        isVirtual: true,
      });

      if (editorStart) {
        offset = posToOffset(view.state.doc, {
          line: editorStart.line,
          character: editorStart.ch,
        })!;
      }
      const editorEnd = doc.transformVirtualToEditor({
        line: range.end.line,
        ch: range.end.character,
        isVirtual: true,
      });
      if (editorEnd) {
        end = posToOffset(view.state.doc, {
          line: editorEnd.line,
          character: editorEnd.ch,
        });
      }
    }

    const dom = renderMarkupContent(contents);

    return { pos: offset, end, create: () => ({ dom }), above: false };
  });
};
