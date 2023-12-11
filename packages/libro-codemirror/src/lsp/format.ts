/* eslint-disable @typescript-eslint/no-parameter-properties */
/* eslint-disable @typescript-eslint/parameter-properties */
import type { TransactionSpec } from '@codemirror/state';
import { StateEffect } from '@codemirror/state';
import type {
  Command,
  EditorView,
  KeyBinding,
  PluginValue,
  ViewUpdate,
} from '@codemirror/view';
import { ViewPlugin } from '@codemirror/view';

import { insertCompletionText } from '../auto-complete/index.js';

import type { CMLSPExtension, LSPExtensionOptions } from './protocol.js';
import { offsetToPos, posToOffset } from './util.js';

export const startFormatEffect = StateEffect.define<boolean>();

export const formatCell: Command = (view: EditorView) => {
  view.dispatch({ effects: startFormatEffect.of(true) });
  return true;
};

export const formatKeymap: readonly KeyBinding[] = [{ key: 'Alt-f', run: formatCell }];

class FormatPlugin implements PluginValue {
  constructor(
    readonly view: EditorView,
    readonly options: LSPExtensionOptions,
  ) {}

  update(update: ViewUpdate) {
    for (const tr of update.transactions) {
      for (const effect of tr.effects) {
        if (effect.is(startFormatEffect)) {
          this.doFormat();
        }
      }
    }
  }

  async doFormat() {
    const lspProvider = await this.options.lspProvider?.();
    if (!lspProvider) {
      return;
    }
    // const { state } = this.view;
    // const currentLine = state.doc.lineAt(state.selection.main.head).number;

    const { editor, virtualDocument, lspConnection } = lspProvider;
    const virtualStartPos = virtualDocument.transformEditorToVirtual(editor, {
      line: 0,
      ch: 0,
      isEditor: true,
    });

    const end = offsetToPos(this.view.state.doc, this.view.state.doc.length);

    const virtualEndPos = virtualDocument.transformEditorToVirtual(editor, {
      line: end.line,
      ch: end.character,
      isEditor: true,
    });

    if (!virtualStartPos || !virtualEndPos) {
      return;
    }

    lspConnection.clientRequests['textDocument/rangeFormatting']
      .request({
        textDocument: { uri: virtualDocument.uri },
        range: {
          start: { line: virtualStartPos.line, character: virtualStartPos.ch },
          end: { line: virtualEndPos.line, character: virtualEndPos.ch },
        },
        options: {
          tabSize: this.view.state.tabSize,
          insertSpaces: true,
        },
      })
      .then((result) => {
        if (result && result?.length) {
          const items = result;
          const transaction: TransactionSpec[] = [];
          items.forEach((item) => {
            const defaultNewLine = {
              line: end.line + 1,
              ch: 0,
            };
            const editorStart =
              virtualDocument.transformVirtualToEditor({
                line: item.range.start.line,
                ch: item.range.start.character,
                isVirtual: true,
              }) ?? defaultNewLine;
            const editorEnd =
              virtualDocument.transformVirtualToEditor({
                line: item.range.end.line,
                ch: item.range.end.character,
                isVirtual: true,
              }) ?? defaultNewLine;

            if (!editorStart || !editorEnd) {
              return;
            }
            const from = posToOffset(this.view.state.doc, {
              line: editorStart.line,
              character: editorStart.ch,
            });
            const to = posToOffset(this.view.state.doc, {
              line: editorEnd.line,
              character: editorEnd.ch,
            });
            // FIXME: 需要处理新增行的情况，目前在virtualdocument无法处理
            // console.log('format', item.range, editorStart, editorEnd, from, to);
            if (from !== undefined && to !== undefined) {
              const trans = insertCompletionText(
                this.view.state,
                item.newText,
                from,
                to,
              );
              transaction.push(trans);
            }
          });
          // console.log(transaction, 'format trans');

          this.view.dispatch(...transaction);
        }
        return;
      })
      .catch(console.error);
  }

  destroy() {
    //
  }
}

export const lspFormat: CMLSPExtension = (options) => {
  return [ViewPlugin.define((view) => new FormatPlugin(view, options))];
};
