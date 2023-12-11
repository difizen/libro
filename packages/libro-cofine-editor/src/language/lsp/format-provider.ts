import type monaco from '@difizen/monaco-editor-core';

import { LangaugeFeatureProvider } from './language-feature-provider.js';

export class FormatProvider
  extends LangaugeFeatureProvider
  implements
    monaco.languages.DocumentFormattingEditProvider,
    monaco.languages.DocumentRangeFormattingEditProvider
{
  displayName = 'libro-e2-format';

  provideDocumentRangeFormattingEdits = async (
    model: monaco.editor.ITextModel,
    range: monaco.Range,
    options: monaco.languages.FormattingOptions,
    token: monaco.CancellationToken,
  ): Promise<monaco.languages.TextEdit[]> => {
    return this.formatDocumentByRange(model, range, options, token);
  };
  provideDocumentFormattingEdits = async (
    model: monaco.editor.ITextModel,
    options: monaco.languages.FormattingOptions,
    token: monaco.CancellationToken,
  ): Promise<monaco.languages.TextEdit[]> => {
    return this.formatDocumentByRange(model, model.getFullModelRange(), options, token);
  };

  formatDocumentByRange = async (
    model: monaco.editor.ITextModel,
    range: monaco.Range,
    options: monaco.languages.FormattingOptions,
    token: monaco.CancellationToken,
  ): Promise<monaco.languages.TextEdit[]> => {
    const provider = await this.getProvider(model);
    if (!provider) {
      return [];
    }

    const { virtualDocument: doc } = provider;
    const result = await this.lspConnection.clientRequests[
      'textDocument/rangeFormatting'
    ].request({
      // TODO: range transform
      // TODO: pyright-extend supoport range format
      range: {
        start: {
          line: range.startLineNumber - 1,
          character: range.startColumn - 1,
        },
        end: {
          line: range.endLineNumber - 1,
          character: range.endColumn - 1,
        },
      },
      textDocument: {
        uri: doc.documentInfo.uri,
      },
      options: {
        insertSpaces: options.insertSpaces,
        tabSize: options.tabSize,
      },
    });

    if (token.isCancellationRequested) {
      return [];
    }

    if (!result) {
      return [];
    }

    const edits: monaco.languages.TextEdit[] = result.map((item) => {
      return {
        range: {
          startColumn: item.range.start.character + 1,
          startLineNumber: item.range.start.line + 1,
          endColumn: item.range.end.character + 1,
          endLineNumber: item.range.end.line + 1,
        },
        text: item.newText,
      };
    });

    return edits;
  };
}
