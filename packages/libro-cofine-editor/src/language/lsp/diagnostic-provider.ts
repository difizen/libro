import type { LibroService } from '@difizen/libro-core';
import { EditorCellView } from '@difizen/libro-core';
import type { ILSPDocumentConnectionManager } from '@difizen/libro-lsp';
import { DisposableCollection } from '@difizen/mana-app';
import type { Disposable } from '@difizen/mana-app';
import * as monaco from '@difizen/monaco-editor-core';

import { LibroE2Editor } from '../../libro-e2-editor.js';
import { MonacoRange, MonacoUri } from '../../types.js';

import { LangaugeFeatureProvider } from './language-feature-provider.js';

export enum MarkerSeverity {
  Hint = 1,
  Info = 2,
  Warning = 4,
  Error = 8,
}

const vererityMap = {
  1: MarkerSeverity.Error,
  2: MarkerSeverity.Warning,
  3: MarkerSeverity.Info,
  4: MarkerSeverity.Hint,
};

export class DiagnosticProvider extends LangaugeFeatureProvider implements Disposable {
  protected toDispose = new DisposableCollection();
  constructor(
    libroService: LibroService,
    lspDocumentConnectionManager: ILSPDocumentConnectionManager,
  ) {
    super(libroService, lspDocumentConnectionManager);
    this.processDiagnostic();
  }

  protected diagnosticList: {
    model: monaco.editor.ITextModel;
    markers: monaco.editor.IMarkerData[];
  }[] = [];

  protected addDiagnostic(
    model: monaco.editor.ITextModel,
    marker: monaco.editor.IMarkerData,
  ) {
    if (
      !this.diagnosticList.some((d) => d.model.uri.toString() === model.uri.toString())
    ) {
      this.diagnosticList.push({
        model,
        markers: [marker],
      });
    } else {
      this.diagnosticList
        .find((d) => d.model.uri.toString() === model.uri.toString())
        ?.markers.push(marker);
    }
  }

  protected clearDiagnostic() {
    this.libroService.active?.model.cells.forEach((item) => {
      if (EditorCellView.is(item)) {
        if (item.editor instanceof LibroE2Editor) {
          const model = item.editor.monacoEditor?.getModel();
          if (model) {
            monaco.editor.setModelMarkers(model, 'libro-e2', []);
          }
        }
      }
    });
  }

  protected displayDiagnostic() {
    this.clearDiagnostic();
    this.diagnosticList.forEach((d) => {
      monaco.editor.setModelMarkers(d.model, 'libro-e2', d.markers);
    });
  }

  async processDiagnostic() {
    const lspConnection = await this.getLSPConnection();
    const toDispose = lspConnection.serverNotifications[
      'textDocument/publishDiagnostics'
    ].event(async (e) => {
      this.diagnosticList = [];
      await Promise.all(
        e.diagnostics.map(async (diagnostic) => {
          const { range } = diagnostic;
          // the diagnostic range must be in current editor
          const editor = await this.getEditorFromLSPPosition(range);
          if (!editor || editor.getOption('lspEnabled') !== true) {
            return;
          }
          const model = editor?.monacoEditor?.getModel();
          if (!model) {
            return;
          }

          const virtualDocument = await this.getVirtualDocument();
          if (!virtualDocument) {
            return;
          }

          const editorStart = virtualDocument.transformVirtualToEditor({
            line: range.start.line,
            ch: range.start.character,
            isVirtual: true,
          });

          const editorEnd = virtualDocument.transformVirtualToEditor({
            line: range.end.line,
            ch: range.end.character,
            isVirtual: true,
          });

          if (!editorStart || !editorEnd) {
            return;
          }

          const markerRange = new MonacoRange(
            editorStart.line + 1,
            editorStart.ch,
            editorEnd.line + 1,
            editorEnd.ch,
          );

          const marker: monaco.editor.IMarkerData = {
            source: diagnostic.source,
            tags: diagnostic.tags,
            message: diagnostic.message,
            code: String(diagnostic.code),
            severity: diagnostic.severity
              ? vererityMap[diagnostic.severity]
              : monaco.MarkerSeverity.Info,
            relatedInformation: diagnostic.relatedInformation?.map((item) => {
              return {
                message: item.message,
                resource: MonacoUri.parse(item.location.uri),
                startLineNumber: markerRange.startLineNumber,
                startColumn: markerRange.startColumn,
                endLineNumber: markerRange.endLineNumber,
                endColumn: markerRange.endColumn,
              };
            }),
            startLineNumber: editorStart.line + 1,
            startColumn: editorStart.ch + 1,
            endLineNumber: editorEnd.line + 1,
            endColumn: editorEnd.ch + 1,
          };

          this.addDiagnostic(model, marker);
        }),
      );

      this.displayDiagnostic();
    });
    this.toDispose.push(toDispose);
  }
  disposed = false;
  dispose() {
    if (this.disposed) {
      return;
    }
    this.toDispose.dispose();
    this.clearDiagnostic();
    this.disposed = true;
  }
}
