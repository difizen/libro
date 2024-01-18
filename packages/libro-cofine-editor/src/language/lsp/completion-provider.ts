import { CompletionTriggerKind } from '@difizen/libro-lsp';
import { languages } from '@difizen/monaco-editor-core';
import type monaco from '@difizen/monaco-editor-core';
import * as lsp from 'vscode-languageserver-protocol';
import { InsertReplaceEdit } from 'vscode-languageserver-protocol';

import { LangaugeFeatureProvider } from './language-feature-provider.js';
import { CompletionItemKind } from './type-concerters.js';

export class CompletionProvider
  extends LangaugeFeatureProvider
  implements monaco.languages.CompletionItemProvider
{
  triggerCharacters: ['.', '[', '"', "'"];

  public provideCompletionItems = async (
    model: monaco.editor.ITextModel,
    position: monaco.Position,
  ): Promise<monaco.languages.CompletionList | undefined> => {
    const result = await this.provideCompletionItemsFromLSPServer(model, position);
    return result;
  };

  protected provideCompletionItemsFromKernel = async (
    model: monaco.editor.ITextModel,
    position: monaco.Position,
  ): Promise<monaco.languages.CompletionList | undefined> => {
    const editor = this.getEditorByModel(model);
    if (!editor || editor.getOption('lspEnabled') !== true) {
      return;
    }

    const reply = await editor.completionProvider?.({
      cursorPosition: editor.getOffsetAt({
        column: position.column,
        line: position.lineNumber,
      }),
    });

    const start = reply?.cursor_start
      ? editor.getPositionAt(reply?.cursor_start)
      : editor.getCursorPosition();
    const end = reply?.cursor_end
      ? editor.getPositionAt(reply?.cursor_end)
      : editor.getCursorPosition();

    const suggestion: languages.CompletionItem[] = (reply?.matches ?? []).map(
      (match) => {
        return {
          label: match,
          kind: languages.CompletionItemKind.Text,
          insertText: match,
          range: {
            startColumn: start?.column,
            startLineNumber: start?.line,
            endColumn: end?.column,
            endLineNumber: end?.line,
          },
        } as languages.CompletionItem;
      },
    );

    return {
      suggestions: suggestion as any,
    };
  };

  protected provideCompletionItemsFromLSPServer = async (
    model: monaco.editor.ITextModel,
    position: monaco.Position,
  ): Promise<monaco.languages.CompletionList | undefined> => {
    const provider = await this.getProvider(model);
    if (!provider) {
      return;
    }
    const editor = this.getEditorByModel(model);
    if (!editor || editor.getOption('lspEnabled') !== true) {
      return;
    }

    const { lspConnection, editor: docEditor, virtualDocument: doc } = provider;

    if (!lspConnection.isReady || !lspConnection.provides('completionProvider')) {
      return;
    }

    const virtualPos = doc.transformEditorToVirtual(docEditor, {
      line: position.lineNumber - 1,
      ch: position.column,
      isEditor: true,
    });

    if (!virtualPos) {
      return;
    }

    const result = await lspConnection.clientRequests[
      'textDocument/completion'
    ].request({
      position: { line: virtualPos.line, character: virtualPos.ch },
      textDocument: {
        uri: doc.documentInfo.uri,
      },
      context: {
        triggerKind: CompletionTriggerKind.Invoked,
      },
    });

    const items = 'items' in result ? result.items : result;

    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: position.column,
    };

    const suggestions: monaco.languages.CompletionItem[] = items.map(
      (item: lsp.CompletionItem) => {
        return this.transformCompletion(item, range);
      },
    );

    if (Array.isArray(result)) {
      return { suggestions };
    }

    return {
      incomplete: result.isIncomplete,
      suggestions,
    };
  };

  resolveCompletionItem = async (
    item: monaco.languages.CompletionItem,
    token: monaco.CancellationToken,
  ): Promise<monaco.languages.CompletionItem | undefined> => {
    const original = (item as any).__original as lsp.CompletionItem | undefined;
    if (!original) {
      return;
    }
    const lspConnection = await this.getLSPConnection();
    const itemResult =
      await lspConnection.clientRequests['completionItem/resolve'].request(original);
    if (token.isCancellationRequested) {
      return;
    }
    const resolve = this.transformCompletion(itemResult, item.range);
    return resolve;
  };

  transformCompletion(
    item: lsp.CompletionItem,
    range: monaco.IRange | monaco.languages.CompletionItemRanges,
  ): monaco.languages.CompletionItem {
    const converted: monaco.languages.CompletionItem = {
      ...item,
      label: item.label,
      sortText: item.sortText,
      filterText: item.filterText,
      insertText: item.insertText ? item.insertText : item.label,
      kind: CompletionItemKind.from(item.kind ?? lsp.CompletionItemKind.Property),
      detail: item.detail,
      documentation: item.documentation,
      command: item.command
        ? {
            id: item.command.command,
            title: item.command.title,
            arguments: item.command?.arguments,
          }
        : undefined,
      range,
      additionalTextEdits: undefined,
    };

    // FIXME: text edit 生成的range有可能在其他的editor上,这里似乎无法处理
    if (item.textEdit) {
      converted.insertText = item.textEdit.newText;
      if (InsertReplaceEdit.is(item.textEdit)) {
        converted.range = {
          insert: convertRange(item.textEdit.insert),
          replace: convertRange(item.textEdit.replace),
        };
      } else {
        converted.range = convertRange(item.textEdit.range);
      }
    }

    if (item.additionalTextEdits) {
      converted.additionalTextEdits = item.additionalTextEdits.map((edit) => {
        return {
          range: convertRange(edit.range),
          text: edit.newText,
        };
      });
    }

    // Stash a few additional pieces of information.
    (converted as any).__original = item;

    return converted;
  }
}

function convertRange(range: lsp.Range): monaco.IRange {
  return {
    startLineNumber: range.start.line + 1,
    startColumn: range.start.character + 1,
    endLineNumber: range.end.line + 1,
    endColumn: range.end.character + 1,
  };
}
