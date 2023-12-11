import type monaco from '@difizen/monaco-editor-core';
import type * as lsp from 'vscode-languageserver-protocol';

import { MonacoRange } from '../../types.js';

import { LangaugeFeatureProvider } from './language-feature-provider.js';

export class HoverProvider
  extends LangaugeFeatureProvider
  implements monaco.languages.HoverProvider
{
  provideHover = async (
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    token: monaco.CancellationToken,
  ): Promise<monaco.languages.Hover | undefined> => {
    const editor = this.getEditorByModel(model);
    if (!editor || editor.getOption('lspEnabled') !== true) {
      return;
    }
    const provider = await this.getProvider(model);
    if (!provider) {
      return;
    }

    const { lspConnection, editor: docEditor, virtualDocument: doc } = provider;

    const virtualPos = doc.transformEditorToVirtual(docEditor, {
      line: position.lineNumber - 1, // lsp is zero based, monaco is one based
      ch: position.column,
      isEditor: true,
    });

    if (!virtualPos) {
      return;
    }

    const result = await lspConnection.clientRequests['textDocument/hover'].request({
      position: { line: virtualPos.line, character: virtualPos.ch },
      textDocument: {
        uri: doc.documentInfo.uri,
      },
    });

    if (!result) {
      return;
    }

    const { contents, range } = result;

    const resultContents = [{ value: formatContents(contents) }];

    let resultRange: monaco.Range | undefined;

    if (range) {
      const editorStart = doc.transformVirtualToEditor({
        line: range.start.line,
        ch: range.start.character,
        isVirtual: true,
      });

      const editorEnd = doc.transformVirtualToEditor({
        line: range.end.line,
        ch: range.end.character,
        isVirtual: true,
      });
      if (editorStart && editorEnd) {
        resultRange = new MonacoRange(
          editorStart.line + 1,
          editorStart.ch + 1,
          editorEnd.line + 1,
          editorEnd.ch + 1,
        );
      }
    }

    if (token.isCancellationRequested) {
      return;
    }

    return {
      contents: resultContents,
      range: resultRange,
    };
  };
}

export function formatContents(
  contents: lsp.MarkupContent | lsp.MarkedString | lsp.MarkedString[],
): string {
  if (Array.isArray(contents)) {
    return contents.map((c) => formatContents(c) + '\n\n').join('');
  } else if (typeof contents === 'string') {
    return contents;
  } else {
    return contents.value;
  }
}
