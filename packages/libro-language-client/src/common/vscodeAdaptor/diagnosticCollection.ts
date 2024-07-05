import { MarkerSeverity } from '@difizen/monaco-editor-core';
import * as monaco from '@difizen/monaco-editor-core';
import type { editor } from '@difizen/monaco-editor-core';
import type { DiagnosticCollection } from 'vscode';
import type { Diagnostic, Uri } from 'vscode';
import { URI } from 'vscode-uri';

import * as c2p from '../codeConverter.js';
import { generateUuid } from '../utils/uuid.js';

import { ResourceMap } from './hostTypeUtil.js';
import { ProtocolToMonacoConverter } from './monaco-converter.js';
import { DiagnosticSeverity, EventEmitter } from './vscodeAdaptor.js';

export class LibroDiagnosticCollection implements DiagnosticCollection {
  #onDidChangeDiagnostics = new EventEmitter<Uri[]>();
  readonly onDidChangeDiagnostics = this.#onDidChangeDiagnostics.event;

  private readonly _maxDiagnosticsPerFile: number = 1000;
  private readonly _maxDiagnosticsTotal: number = 1.1 * this._maxDiagnosticsPerFile;
  protected readonly c2p: c2p.Converter = c2p.createConverter();
  protected readonly p2m: ProtocolToMonacoConverter = new ProtocolToMonacoConverter(
    monaco,
  );

  name: string;
  constructor(name?: string) {
    this.name = name ?? `libro-marker-${generateUuid()}`;
  }
  readonly #data: ResourceMap<Diagnostic[]> = new ResourceMap();
  private _isDisposed = false;
  set(uri: Uri, diagnostics: ReadonlyArray<Diagnostic>): void;
  set(entries: ReadonlyArray<[Uri, ReadonlyArray<Diagnostic>]>): void;
  set(
    first: Uri | ReadonlyArray<[Uri, ReadonlyArray<Diagnostic>]>,
    diagnostics?: ReadonlyArray<Diagnostic>,
  ) {
    if (!first) {
      // this set-call is a clear-call
      this.clear();
      return;
    }

    // the actual implementation for #set

    this._checkDisposed();
    let toSync: Uri[] = [];

    if (URI.isUri(first)) {
      if (!diagnostics) {
        // remove this entry
        this.delete(first);
        return;
      }

      // update single row
      this.#data.set(first, diagnostics.slice());
      toSync = [first];
    } else if (Array.isArray(first)) {
      // update many rows
      toSync = [];
      let lastUri: Uri | undefined;

      // ensure stable-sort
      first = [...first].sort(LibroDiagnosticCollection._compareIndexedTuplesByUri);

      for (const tuple of first) {
        const [uri, diagnostics] = tuple;
        if (!lastUri || uri.toString() !== lastUri.toString()) {
          if (lastUri && this.#data.get(lastUri)!.length === 0) {
            this.#data.delete(lastUri);
          }
          lastUri = uri;
          toSync.push(uri);
          this.#data.set(uri, []);
        }

        if (!diagnostics) {
          // [Uri, undefined] means clear this
          const currentDiagnostics = this.#data.get(uri);
          if (currentDiagnostics) {
            currentDiagnostics.length = 0;
          }
        } else {
          const currentDiagnostics = this.#data.get(uri);
          currentDiagnostics?.push(...diagnostics);
        }
      }
    }

    // send event for extensions
    this.#onDidChangeDiagnostics.fire(toSync);

    // // compute change and send to main side
    // if (!this.#proxy) {
    //   return;
    // }
    const entries: [URI, editor.IMarkerData[]][] = [];
    let totalMarkerCount = 0;
    for (const uri of toSync) {
      let marker: editor.IMarkerData[] = [];
      const diagnostics = this.#data.get(uri);
      if (diagnostics) {
        // no more than N diagnostics per file
        if (diagnostics.length > this._maxDiagnosticsPerFile) {
          marker = [];
          const order = [
            DiagnosticSeverity.Error,
            DiagnosticSeverity.Warning,
            DiagnosticSeverity.Information,
            DiagnosticSeverity.Hint,
          ];
          orderLoop: for (let i = 0; i < 4; i++) {
            for (const diagnostic of diagnostics) {
              if (diagnostic.severity === order[i]) {
                const diag = this.p2m.asDiagnostic(this.c2p.asDiagnostic(diagnostic));
                const len = marker.push(diag);
                if (len === this._maxDiagnosticsPerFile) {
                  break orderLoop;
                }
              }
            }
          }

          // add 'signal' marker for showing omitted errors/warnings
          marker.push({
            severity: MarkerSeverity.Info,
            message: `Not showing ${diagnostics.length - this._maxDiagnosticsPerFile} further errors and warnings.`,
            startLineNumber: marker[marker.length - 1].startLineNumber,
            startColumn: marker[marker.length - 1].startColumn,
            endLineNumber: marker[marker.length - 1].endLineNumber,
            endColumn: marker[marker.length - 1].endColumn,
          });
        } else {
          marker = diagnostics.map((diag) => {
            const mark = this.p2m.asDiagnostic(this.c2p.asDiagnostic(diag));
            return mark;
          });
        }
      }

      entries.push([uri, marker]);

      // update monaco
      this.updateModelMarkers(uri, marker);

      totalMarkerCount += marker.length;
      if (totalMarkerCount > this._maxDiagnosticsTotal) {
        // ignore markers that are above the limit
        break;
      }
    }
  }

  delete(uri: Uri): void {
    this._checkDisposed();
    this.#onDidChangeDiagnostics.fire([uri]);
    this.#data.delete(uri);
  }

  clear(): void {
    this._checkDisposed();
    this.#onDidChangeDiagnostics.fire([...this.#data.keys()]);
    this.#data.clear();
  }

  forEach(
    callback: (
      uri: URI,
      diagnostics: ReadonlyArray<Diagnostic>,
      collection: DiagnosticCollection,
    ) => any,
    thisArg?: any,
  ): void {
    this._checkDisposed();
    for (const [uri, values] of this) {
      callback.call(thisArg, uri, values, this);
    }
  }

  *[Symbol.iterator](): IterableIterator<
    [uri: Uri, diagnostics: readonly Diagnostic[]]
  > {
    this._checkDisposed();
    for (const uri of this.#data.keys()) {
      yield [uri, this.get(uri)];
    }
  }

  get(uri: URI): ReadonlyArray<Diagnostic> {
    this._checkDisposed();
    const result = this.#data.get(uri);
    if (Array.isArray(result)) {
      return Object.freeze(result.slice(0));
    }
    return [];
  }

  has(uri: URI): boolean {
    this._checkDisposed();
    return Array.isArray(this.#data.get(uri));
  }

  private _checkDisposed() {
    if (this._isDisposed) {
      throw new Error('illegal state - object is disposed');
    }
  }

  private static _compareIndexedTuplesByUri(
    a: [Uri, readonly Diagnostic[]],
    b: [Uri, readonly Diagnostic[]],
  ): number {
    if (a[0].toString() < b[0].toString()) {
      return -1;
    } else if (a[0].toString() > b[0].toString()) {
      return 1;
    } else {
      return 0;
    }
  }

  updateModelMarkers(uri: Uri, markers: editor.IMarkerData[]): void {
    const model = monaco.editor.getModel(uri);
    if (model) {
      monaco.editor.setModelMarkers(model, this.name, markers);
    }
  }

  dispose(): void {
    if (!this._isDisposed) {
      this.#onDidChangeDiagnostics.fire([...this.#data.keys()]);
      this.#data.clear();
      this._isDisposed = true;
    }
  }
}
