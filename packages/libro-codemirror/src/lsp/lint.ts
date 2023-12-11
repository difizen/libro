import type { Diagnostic } from '@codemirror/lint';
import { setDiagnostics } from '@codemirror/lint';
import type { PluginValue, EditorView } from '@codemirror/view';
import { ViewPlugin } from '@codemirror/view';
import { DiagnosticSeverity } from '@difizen/libro-lsp';

import type { CMLSPExtension, LSPExtensionOptions } from './protocol.js';
import { posToOffset } from './util.js';

class LintPlugin implements PluginValue {
  constructor(
    readonly view: EditorView,
    readonly options: LSPExtensionOptions,
  ) {
    this.processDiagnostic();
  }

  processDiagnostic() {
    if (!this.options.lspProvider) {
      return;
    }
    this.options
      .lspProvider()
      .then(({ lspConnection, virtualDocument, editor }) => {
        lspConnection.serverNotifications['textDocument/publishDiagnostics'].event(
          (e) => {
            const diagnostics = e.diagnostics
              .map(({ range, message, severity = DiagnosticSeverity.Information }) => {
                const currentEditor = virtualDocument.getEditorAtVirtualLine({
                  line: range.start.line,
                  ch: range.start.character,
                  isVirtual: true,
                });

                // the diagnostic range must be in current editor
                if (editor !== currentEditor) {
                  return;
                }

                const editorStart = virtualDocument.transformVirtualToEditor({
                  line: range.start.line,
                  ch: range.start.character,
                  isVirtual: true,
                });

                let offset: number | undefined;
                if (editorStart) {
                  offset = posToOffset(this.view.state.doc, {
                    line: editorStart.line,
                    character: editorStart.ch,
                  })!;
                }

                const editorEnd = virtualDocument.transformVirtualToEditor({
                  line: range.end.line,
                  ch: range.end.character,
                  isVirtual: true,
                });

                let end: number | undefined;
                if (editorEnd) {
                  end = posToOffset(this.view.state.doc, {
                    line: editorEnd.line,
                    character: editorEnd.ch,
                  });
                }
                return {
                  from: offset,
                  to: end,
                  severity: (
                    {
                      [DiagnosticSeverity.Error]: 'error',
                      [DiagnosticSeverity.Warning]: 'warning',
                      [DiagnosticSeverity.Information]: 'info',
                      [DiagnosticSeverity.Hint]: 'info',
                    } as const
                  )[severity],
                  message,
                } as Diagnostic;
              })
              .filter<Diagnostic>(isDiagnostic)
              .sort((a, b) => {
                switch (true) {
                  case a.from < b.from:
                    return -1;
                  case a.from > b.from:
                    return 1;
                }
                return 0;
              });

            this.view.dispatch(setDiagnostics(this.view.state, diagnostics));
          },
        );
        return;
      })
      .catch(console.error);
  }

  update() {
    //
  }

  destroy() {
    //
  }
}

export const lspLint: CMLSPExtension = (options) => {
  return [ViewPlugin.define((view) => new LintPlugin(view, options))];
};

function isDiagnostic(item: any): item is Diagnostic {
  return (
    item !== undefined &&
    item !== null &&
    item.from !== null &&
    item.to !== null &&
    item.from !== undefined &&
    item.to !== undefined
  );
}
