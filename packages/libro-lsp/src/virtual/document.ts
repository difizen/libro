/* eslint-disable @typescript-eslint/no-use-before-define */
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import type {
  IPosition as CodeEditorPosition,
  IRange,
} from '@difizen/libro-code-editor';
import type { Disposable, Event } from '@difizen/libro-common/app';
import { Emitter } from '@difizen/libro-common/app';
import { inject, transient } from '@difizen/libro-common/app';

import type { IForeignCodeExtractor } from '../extractors/types.js';
import type { LanguageIdentifier } from '../lsp.js';
import type {
  IEditorPosition,
  IRootPosition,
  ISourcePosition,
  IVirtualPosition,
  LspPosition,
} from '../positioning.js';
import type { Document, ILSPCodeExtractorsManager } from '../tokens.js';
import { ILSPDocumentConnectionManager } from '../tokens.js';
import { DefaultMap, untilReady } from '../utils.js';
import type { IDocumentInfo } from '../ws-connection/types.js';

type language = string;

interface IVirtualLine {
  /**
   * Inspections for which document should be skipped for this virtual line?
   */
  skipInspect: VirtualDocument.idPath[];

  /**
   * Where does the virtual line belongs to in the source document?
   */
  sourceLine: number | null;

  /**
   * The editor holding this virtual line
   */
  editor: Document.IEditor;
}

export type ForeignDocumentsMap = Map<IRange, Document.IVirtualDocumentBlock>;

interface ISourceLine {
  /**
   * Line corresponding to the block in the entire foreign document
   */
  virtualLine: number;

  /**
   * The CM editor associated with this virtual line.
   */
  editor: Document.IEditor;

  /**
   * Line in the CM editor corresponding to the virtual line.
   */
  editorLine: number;

  /**
   * Shift of the virtual line
   */
  editorShift: CodeEditorPosition;

  /**
   * Everything which is not in the range of foreign documents belongs to the host.
   */
  foreignDocumentsMap: ForeignDocumentsMap;
}

/**
 * Check if given position is within range.
 * Both start and end are inclusive.
 * @param position
 * @param range
 */
export function isWithinRange(position: CodeEditorPosition, range: IRange): boolean {
  if (range.start.line === range.end.line) {
    return (
      position.line === range.start.line &&
      position.column >= range.start.column &&
      position.column <= range.end.column
    );
  }

  return (
    (position.line === range.start.line &&
      position.column >= range.start.column &&
      position.line < range.end.line) ||
    (position.line > range.start.line &&
      position.column <= range.end.column &&
      position.line === range.end.line) ||
    (position.line > range.start.line && position.line < range.end.line)
  );
}

export const VirtualDocumentInfoFactory = Symbol('VirtualDocumentInfoFactory');
export type VirtualDocumentInfoFactory = (
  document: VirtualDocument,
) => VirtualDocumentInfo;
export const VirtualDocumentInfoOptions = Symbol('VirtualDocumentInfoOptions');
export type VirtualDocumentInfoOptions = VirtualDocument;

/**
 * A virtual implementation of IDocumentInfo
 */
@transient()
export class VirtualDocumentInfo implements IDocumentInfo {
  @inject(ILSPDocumentConnectionManager)
  protected readonly connectionManager: ILSPDocumentConnectionManager;
  /**
   * Creates an instance of VirtualDocumentInfo.
   * @param document - the virtual document need to
   * be wrapped.
   */
  constructor(@inject(VirtualDocumentInfoOptions) document: VirtualDocument) {
    this._document = document;
  }

  /**
   * Current version of the virtual document.
   */
  version = 0;

  /**
   * Get the text content of the virtual document.
   */
  get text(): string {
    return this._document.value;
  }

  /**
   * Get the uri of the virtual document, if the document is not available,
   * it returns an empty string, users need to check for the length of returned
   * value before using it.
   */
  get uri(): string {
    const uris = this.connectionManager.solveUris(this._document, this.languageId);
    if (!uris) {
      return '';
    }
    return uris.document;
  }

  /**
   * Get the language identifier of the document.
   */
  get languageId(): string {
    return this._document.language;
  }

  /**
   * The wrapped virtual document.
   */
  protected _document: VirtualDocument;
}

export interface IVirtualDocumentOptions {
  /**
   * The language identifier of the document.
   */
  language: LanguageIdentifier;

  /**
   * The foreign code extractor manager token.
   */
  foreignCodeExtractors: ILSPCodeExtractorsManager;

  /**
   * Path to the document.
   */
  path: string;

  /**
   * File extension of the document.
   */
  fileExtension: string | undefined;

  /**
   * Notebooks or any other aggregates of documents are not supported
   * by the LSP specification, and we need to make appropriate
   * adjustments for them, pretending they are simple files
   * so that the LSP servers do not refuse to cooperate.
   */
  hasLspSupportedFile: boolean;

  /**
   * Being standalone is relevant to foreign documents
   * and defines whether following chunks of code in the same
   * language should be appended to this document (false, not standalone)
   * or should be considered separate documents (true, standalone)
   *
   */
  standalone?: boolean;

  /**
   * Parent of the current virtual document.
   */
  parent?: VirtualDocument;
}

export const VirtualDocumentFactory = Symbol('VirtualDocumentFactory');
export type VirtualDocumentFactory = (
  options: IVirtualDocumentOptions,
) => VirtualDocument;
export const IVirtualDocumentOptions = Symbol('IVirtualDocumentOptions');

/**
 *
 * A notebook can hold one or more virtual documents; there is always one,
 * "root" document, corresponding to the language of the kernel. All other
 * virtual documents are extracted out of the notebook, based on magics,
 * or other syntax constructs, depending on the kernel language.
 *
 * Virtual documents represent the underlying code in a single language,
 * which has been parsed excluding interactive kernel commands (magics)
 * which could be misunderstood by the specific LSP server.
 *
 * VirtualDocument has no awareness of the notebook or editor it lives in,
 * however it is able to transform its content back to the notebook space,
 * as it keeps editor coordinates for each virtual line.
 *
 * The notebook/editor aware transformations are preferred to be placed in
 * VirtualEditor descendants rather than here.
 *
 * No dependency on editor implementation (such as CodeMirrorEditor)
 * is allowed for VirtualEditor.
 */
@transient()
export class VirtualDocument implements Disposable {
  @inject(VirtualDocumentFactory) protected readonly factory: VirtualDocumentFactory;
  constructor(
    @inject(IVirtualDocumentOptions) options: IVirtualDocumentOptions,
    @inject(VirtualDocumentInfoFactory) docInfofactory: VirtualDocumentInfoFactory,
  ) {
    this.options = options;
    this.path = this.options.path;
    this.fileExtension = options.fileExtension;
    this.hasLspSupportedFile = options.hasLspSupportedFile;
    this.parent = options.parent;
    this.language = options.language;

    this.virtualLines = new Map();
    this.sourceLines = new Map();
    this.foreignDocuments = new Map();
    this._editorToSourceLine = new Map();
    this._foreignCodeExtractors = options.foreignCodeExtractors;
    this.standalone = options.standalone || false;
    this.instanceId = VirtualDocument.instancesCount;
    VirtualDocument.instancesCount += 1;
    this.unusedStandaloneDocuments = new DefaultMap(() => new Array<VirtualDocument>());
    this._remainingLifetime = 6;

    this.unusedDocuments = new Set();
    this.documentInfo = docInfofactory(this);

    this.updateManager = new UpdateManager(this);
    this.updateManager.updateBegan(this._updateBeganSlot, this);
    this.updateManager.blockAdded(this._blockAddedSlot, this);
    this.updateManager.updateFinished(this._updateFinishedSlot, this);
    this.clear();
  }

  /**
   * Convert from code editor position into code mirror position.
   */
  static ceToCm(position: CodeEditorPosition): LspPosition {
    return { line: position.line, ch: position.column };
  }

  /**
   * Number of blank lines appended to the virtual document between
   * each cell.
   */
  blankLinesBetweenCells = 2;

  /**
   * Line number of the last line in the real document.
   */
  lastSourceLine: number;

  /**
   * Line number of the last line in the virtual document.
   */
  lastVirtualLine: number;

  /**
   * the remote document uri, version and other server-related info
   */
  documentInfo: IDocumentInfo;

  /**
   * Parent of the current virtual document.
   */
  parent?: VirtualDocument | null;

  /**
   * The language identifier of the document.
   */
  readonly language: string;

  /**
   * Being standalone is relevant to foreign documents
   * and defines whether following chunks of code in the same
   * language should be appended to this document (false, not standalone)
   * or should be considered separate documents (true, standalone)
   */
  readonly standalone: boolean;

  /**
   * Path to the document.
   */
  readonly path: string;

  /**
   * File extension of the document.
   */
  readonly fileExtension: string | undefined;

  /**
   * Notebooks or any other aggregates of documents are not supported
   * by the LSP specification, and we need to make appropriate
   * adjustments for them, pretending they are simple files
   * so that the LSP servers do not refuse to cooperate.
   */
  readonly hasLspSupportedFile: boolean;

  /**
   * Map holding the children `VirtualDocument` .
   */
  readonly foreignDocuments: Map<VirtualDocument.virtualId, VirtualDocument>;

  /**
   * The update manager object.
   */
  readonly updateManager: UpdateManager;

  /**
   * Unique id of the virtual document.
   */
  readonly instanceId: number;

  /**
   * Test whether the document is disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Signal emitted when the foreign document is closed
   */
  get foreignDocumentClosed(): Event<Document.IForeignContext> {
    return this._foreignDocumentClosed.event;
  }

  /**
   * Signal emitted when the foreign document is opened
   */
  get foreignDocumentOpened(): Event<Document.IForeignContext> {
    return this._foreignDocumentOpened.event;
  }

  /**
   * Signal emitted when the foreign document is changed
   */
  get changed(): Event<VirtualDocument> {
    return this._changed.event;
  }

  /**
   * Id of the virtual document.
   */
  get virtualId(): VirtualDocument.virtualId {
    // for easier debugging, the language information is included in the ID:
    return this.standalone
      ? this.instanceId + '(' + this.language + ')'
      : this.language;
  }

  /**
   * Return the ancestry to this document.
   */
  get ancestry(): VirtualDocument[] {
    if (!this.parent) {
      return [this];
    }
    return this.parent.ancestry.concat([this]);
  }

  /**
   * Return the id path to the virtual document.
   */
  get idPath(): VirtualDocument.idPath {
    if (!this.parent) {
      return this.virtualId;
    }
    return this.parent.idPath + '-' + this.virtualId;
  }

  /**
   * Get the uri of the virtual document.
   */
  get uri(): VirtualDocument.uri {
    const encodedPath = encodeURI(this.path);
    if (!this.parent) {
      return encodedPath;
    }
    return encodedPath + '.' + this.idPath + '.' + this.fileExtension;
  }

  /**
   * Get the text value of the document
   */
  get value(): string {
    const linesPadding = '\n'.repeat(this.blankLinesBetweenCells);
    return this.lineBlocks.join(linesPadding);
  }

  /**
   * Get the last line in the virtual document
   */
  get lastLine(): string {
    const linesInLastBlock = this.lineBlocks[this.lineBlocks.length - 1].split('\n');
    return linesInLastBlock[linesInLastBlock.length - 1];
  }

  /**
   * Get the root document of current virtual document.
   */
  get root(): VirtualDocument {
    return this.parent ? this.parent.root : this;
  }

  /**
   * Dispose the virtual document.
   */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;

    this.parent = null;

    this.closeAllForeignDocuments();

    this.updateManager.dispose();
    // clear all the maps

    this.foreignDocuments.clear();
    this.sourceLines.clear();
    this.unusedDocuments.clear();
    this.unusedStandaloneDocuments.clear();
    this.virtualLines.clear();

    // just to be sure - if anything is accessed after disposal (it should not) we
    // will get altered by errors in the console AND this will limit memory leaks

    this.documentInfo = null as any;
    this.lineBlocks = null as any;
  }

  /**
   * Clear the virtual document and all related stuffs
   */
  clear(): void {
    for (const document of this.foreignDocuments.values()) {
      document.clear();
    }

    // TODO - deep clear (assure that there is no memory leak)
    this.unusedStandaloneDocuments.clear();

    this.unusedDocuments = new Set();
    this.virtualLines.clear();
    this.sourceLines.clear();
    this.lastVirtualLine = 0;
    this.lastSourceLine = 0;
    this.lineBlocks = [];
  }

  /**
   * Get the virtual document from the cursor position of the source
   * document
   * @param position - position in source document
   */
  documentAtSourcePosition(position: ISourcePosition): VirtualDocument {
    const sourceLine = this.sourceLines.get(position.line);

    if (!sourceLine) {
      return this;
    }

    const sourcePositionCe: CodeEditorPosition = {
      line: sourceLine.editorLine,
      column: position.ch,
    };

    for (const [
      range,
      { virtualDocument: document },
    ] of sourceLine.foreignDocumentsMap) {
      if (isWithinRange(sourcePositionCe, range)) {
        const sourcePositionCm = {
          line: sourcePositionCe.line - range.start.line,
          ch: sourcePositionCe.column - range.start.column,
        };

        return document.documentAtSourcePosition(sourcePositionCm as ISourcePosition);
      }
    }

    return this;
  }

  /**
   * Detect if the input source position is belong to the current
   * virtual document.
   *
   * @param sourcePosition - position in the source document
   */
  isWithinForeign(sourcePosition: ISourcePosition): boolean {
    const sourceLine = this.sourceLines.get(sourcePosition.line)!;

    const sourcePositionCe: CodeEditorPosition = {
      line: sourceLine.editorLine,
      column: sourcePosition.ch,
    };
    for (const [range] of sourceLine.foreignDocumentsMap) {
      if (isWithinRange(sourcePositionCe, range)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Compute the position in root document from the position of
   * a child editor.
   *
   * @param editor - the active editor.
   * @param position - position in the active editor.
   */
  transformFromEditorToRoot(
    editor: Document.IEditor,
    position: IEditorPosition,
  ): IRootPosition | null {
    if (!this._editorToSourceLine.has(editor)) {
      console.warn('Editor not found in _editorToSourceLine map');
      return null;
    }
    const shift = this._editorToSourceLine.get(editor)!;
    return {
      ...(position as LspPosition),
      line: position.line + shift,
    } as IRootPosition;
  }

  /**
   * Compute the position in virtual document from the position of
   * a child editor.
   *
   * @param editor - the active editor.
   * @param position - position in the active editor.
   */
  transformEditorToVirtual(
    editor: Document.IEditor,
    position: IEditorPosition,
  ): IVirtualPosition | null {
    const rootPosition = this.transformFromEditorToRoot(editor, position);
    if (!rootPosition) {
      return null;
    }
    return this.virtualPositionAtDocument(rootPosition);
  }

  /**
   * Compute the position in the virtual document from the position
   * in the source document.
   *
   * @param sourcePosition - position in source document
   */
  virtualPositionAtDocument(sourcePosition: ISourcePosition): IVirtualPosition {
    const sourceLine = this.sourceLines.get(sourcePosition.line);
    if (!sourceLine) {
      throw new Error('Source line not mapped to virtual position');
    }
    const virtualLine = sourceLine.virtualLine;

    // position inside the cell (block)
    const sourcePositionCe: CodeEditorPosition = {
      line: sourceLine.editorLine,
      column: sourcePosition.ch,
    };

    for (const [range, content] of sourceLine.foreignDocumentsMap) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const { virtualLine, virtualDocument: document } = content;
      if (isWithinRange(sourcePositionCe, range)) {
        // position inside the foreign document block
        const sourcePositionCm = {
          line: sourcePositionCe.line - range.start.line,
          ch: sourcePositionCe.column - range.start.column,
        };
        if (document.isWithinForeign(sourcePositionCm as ISourcePosition)) {
          return this.virtualPositionAtDocument(sourcePositionCm as ISourcePosition);
        } else {
          // where in this block in the entire foreign document?
          sourcePositionCm.line += virtualLine;
          return sourcePositionCm as IVirtualPosition;
        }
      }
    }

    return {
      ch: sourcePosition.ch,
      line: virtualLine,
    } as IVirtualPosition;
  }

  /**
   * Append a code block to the end of the virtual document.
   *
   * @param  block - block to be appended
   * @param  editorShift - position shift in source
   * document
   * @param  [virtualShift] - position shift in
   * virtual document.
   */
  appendCodeBlock(
    block: Document.ICodeBlockOptions,
    editorShift: CodeEditorPosition = { line: 0, column: 0 },
    virtualShift?: CodeEditorPosition,
  ): void {
    const cellCode = block.value;
    const ceEditor = block.ceEditor;

    if (this.isDisposed) {
      console.warn('Cannot append code block: document disposed');
      return;
    }
    const sourceCellLines = cellCode.split('\n');
    const { lines, foreignDocumentsMap } = this.prepareCodeBlock(block, editorShift);

    for (let i = 0; i < lines.length; i++) {
      this.virtualLines.set(this.lastVirtualLine + i, {
        skipInspect: [],
        editor: ceEditor,
        // TODO this is incorrect, wont work if something was extracted
        sourceLine: this.lastSourceLine + i,
      });
    }
    for (let i = 0; i < sourceCellLines.length; i++) {
      this.sourceLines.set(this.lastSourceLine + i, {
        editorLine: i,
        editorShift: {
          line: editorShift.line - (virtualShift?.line || 0),
          column: i === 0 ? editorShift.column - (virtualShift?.column || 0) : 0,
        },
        // TODO: move those to a new abstraction layer (DocumentBlock class)
        editor: ceEditor,
        foreignDocumentsMap,
        // TODO this is incorrect, wont work if something was extracted
        virtualLine: this.lastVirtualLine + i,
      });
    }

    this.lastVirtualLine += lines.length;

    // one empty line is necessary to separate code blocks, next 'n' lines are to silence linters;
    // the final cell does not get the additional lines (thanks to the use of join, see below)

    this.lineBlocks.push(lines.join('\n') + '\n');

    // adding the virtual lines for the blank lines
    for (let i = 0; i < this.blankLinesBetweenCells; i++) {
      this.virtualLines.set(this.lastVirtualLine + i, {
        skipInspect: [this.idPath],
        editor: ceEditor,
        sourceLine: null,
      });
    }

    this.lastVirtualLine += this.blankLinesBetweenCells;
    this.lastSourceLine += sourceCellLines.length;
  }

  /**
   * Extract a code block into list of string in supported language and
   * a map of foreign document if any.
   * @param  block - block to be appended
   * @param  editorShift - position shift in source document
   */
  prepareCodeBlock(
    block: Document.ICodeBlockOptions,
    editorShift: CodeEditorPosition = { line: 0, column: 0 },
  ): {
    lines: string[];
    foreignDocumentsMap: Map<IRange, Document.IVirtualDocumentBlock>;
  } {
    const { cellCodeKept, foreignDocumentsMap } = this.extractForeignCode(
      block,
      editorShift,
    );
    const lines = cellCodeKept.split('\n');
    return { lines, foreignDocumentsMap };
  }

  /**
   * Extract the foreign code from input block by using the registered
   * extractors.
   * @param  block - block to be appended
   * @param  editorShift - position shift in source document
   */
  extractForeignCode(
    block: Document.ICodeBlockOptions,
    editorShift: CodeEditorPosition,
  ): {
    cellCodeKept: string;
    foreignDocumentsMap: Map<IRange, Document.IVirtualDocumentBlock>;
  } {
    const foreignDocumentsMap = new Map<IRange, Document.IVirtualDocumentBlock>();

    let cellCode = block.value;
    const extractorsForAnyLang = this._foreignCodeExtractors.getExtractors(
      block.type,
      null,
    );
    const extractorsForCurrentLang = this._foreignCodeExtractors.getExtractors(
      block.type,
      this.language,
    );

    for (const extractor of [...extractorsForAnyLang, ...extractorsForCurrentLang]) {
      if (!extractor.hasForeignCode(cellCode, block.type)) {
        continue;
      }

      const results = extractor.extractForeignCode(cellCode);

      let keptCellCode = '';

      for (const result of results) {
        if (result.foreignCode !== null) {
          // result.range should only be null if result.foregin_code is null
          if (result.range === null) {
            console.warn(
              'Failure in foreign code extraction: `range` is null but `foreign_code` is not!',
            );
            continue;
          }
          const foreignDocument = this.chooseForeignDocument(extractor);
          foreignDocumentsMap.set(result.range, {
            virtualLine: foreignDocument.lastVirtualLine,
            virtualDocument: foreignDocument,
            editor: block.ceEditor,
          });
          const foreignShift = {
            line: editorShift.line + result.range.start.line,
            column: editorShift.column + result.range.start.column,
          };
          foreignDocument.appendCodeBlock(
            {
              value: result.foreignCode,
              ceEditor: block.ceEditor,
              type: 'code',
            },
            foreignShift,
            result.virtualShift!,
          );
        }
        if (result.hostCode !== null) {
          keptCellCode += result.hostCode;
        }
      }
      // not breaking - many extractors are allowed to process the code, one after each other
      // (think JS and CSS in HTML, or %R inside of %%timeit).

      cellCode = keptCellCode;
    }

    return { cellCodeKept: cellCode, foreignDocumentsMap };
  }

  /**
   * Close a foreign document and disconnect all associated signals
   */
  closeForeign(document: VirtualDocument): void {
    this._foreignDocumentClosed.fire({
      foreignDocument: document,
      parentHost: this,
    });
    // remove it from foreign documents list
    this.foreignDocuments.delete(document.virtualId);
    // and delete the documents within it
    document.closeAllForeignDocuments();

    // document.foreignDocumentClosed.disconnect(this.forwardClosedSignal, this);
    // document.foreignDocumentOpened.disconnect(this.forwardOpenedSignal, this);
    document.dispose();
  }

  /**
   * Close all foreign documents.
   */
  closeAllForeignDocuments(): void {
    for (const document of this.foreignDocuments.values()) {
      this.closeForeign(document);
    }
  }

  /**
   * Close all expired documents.
   */
  closeExpiredDocuments(): void {
    for (const document of this.unusedDocuments.values()) {
      document.remainingLifetime -= 1;
      if (document.remainingLifetime <= 0) {
        document.dispose();
      }
    }
  }

  /**
   * Transform the position of the source to the editor
   * position.
   *
   * @param  pos - position in the source document
   * @return position in the editor.
   */
  transformSourceToEditor(pos: ISourcePosition): IEditorPosition {
    const sourceLine = this.sourceLines.get(pos.line)!;
    const editorLine = sourceLine.editorLine;
    const editorShift = sourceLine.editorShift;
    return {
      // only shift column in the line beginning the virtual document (first list of the editor in cell magics, but might be any line of editor in line magics!)
      ch: pos.ch + (editorLine === 0 ? editorShift.column : 0),
      line: editorLine + editorShift.line,
      // TODO or:
      //  line: pos.line + editor_shift.line - this.first_line_of_the_block(editor)
    } as IEditorPosition;
  }

  /**
   * Transform the position in the virtual document to the
   * editor position.
   * Can be null because some lines are added as padding/anchors
   * to the virtual document and those do not exist in the source document
   * and thus they are absent in the editor.
   */
  transformVirtualToEditor(virtualPosition: IVirtualPosition): IEditorPosition | null {
    const sourcePosition = this.transformVirtualToSource(virtualPosition);
    if (!sourcePosition) {
      return null;
    }
    return this.transformSourceToEditor(sourcePosition);
  }

  /**
   * Transform the position in the virtual document to the source.
   * Can be null because some lines are added as padding/anchors
   * to the virtual document and those do not exist in the source document.
   */
  transformVirtualToSource(position: IVirtualPosition): ISourcePosition | null {
    const line = this.virtualLines.get(position.line)!.sourceLine;
    if (line === null) {
      return null;
    }
    return {
      ch: position.ch,
      line: line,
    } as ISourcePosition;
  }

  /**
   * Get the corresponding editor of the virtual line.
   */
  getEditorAtVirtualLine(pos: IVirtualPosition): Document.IEditor {
    let line = pos.line;
    // tolerate overshot by one (the hanging blank line at the end)
    if (!this.virtualLines.has(line)) {
      line -= 1;
    }
    return this.virtualLines.get(line)!.editor;
  }

  /**
   * Get the corresponding editor of the source line
   */
  getEditorAtSourceLine(pos: ISourcePosition): Document.IEditor {
    return this.sourceLines.get(pos.line)!.editor;
  }

  /**
   * Recursively emits changed signal from the document or any descendant foreign document.
   */
  maybeEmitChanged(): void {
    if (this.value !== this.previousValue) {
      this._changed.fire(this);
    }
    this.previousValue = this.value;
    for (const document of this.foreignDocuments.values()) {
      document.maybeEmitChanged();
    }
  }

  /**
   * When this counter goes down to 0, the document will be destroyed and the associated connection will be closed;
   * This is meant to reduce the number of open connections when a a foreign code snippet was removed from the document.
   *
   * Note: top level virtual documents are currently immortal (unless killed by other means); it might be worth
   * implementing culling of unused documents, but if and only if JupyterLab will also implement culling of
   * idle kernels - otherwise the user experience could be a bit inconsistent, and we would need to invent our own rules.
   */
  protected get remainingLifetime(): number {
    if (!this.parent) {
      return Infinity;
    }
    return this._remainingLifetime;
  }

  protected set remainingLifetime(value: number) {
    if (this.parent) {
      this._remainingLifetime = value;
    }
  }

  /**
   * Virtual lines keep all the lines present in the document AND extracted to the foreign document.
   */
  protected virtualLines: Map<number, IVirtualLine>;
  protected sourceLines: Map<number, ISourceLine>;
  protected lineBlocks: string[];

  protected unusedDocuments: Set<VirtualDocument>;
  protected unusedStandaloneDocuments: DefaultMap<language, VirtualDocument[]>;

  protected _isDisposed = false;
  protected _remainingLifetime: number;
  protected _editorToSourceLine: Map<Document.IEditor, number>;
  protected _editorToSourceLineNew: Map<Document.IEditor, number>;
  protected _foreignCodeExtractors: ILSPCodeExtractorsManager;
  protected previousValue: string;
  protected static instancesCount = 0;
  protected readonly options: IVirtualDocumentOptions;

  /**
   * Get the foreign document that can be opened with the input extractor.
   */
  protected chooseForeignDocument(extractor: IForeignCodeExtractor): VirtualDocument {
    let foreignDocument: VirtualDocument;
    // if not standalone, try to append to existing document
    const foreignExists = this.foreignDocuments.has(extractor.language);
    if (!extractor.standalone && foreignExists) {
      foreignDocument = this.foreignDocuments.get(extractor.language)!;
    } else {
      // if (previous document does not exists) or (extractor produces standalone documents
      // and no old standalone document could be reused): create a new document
      foreignDocument = this.openForeign(
        extractor.language,
        extractor.standalone,
        extractor.fileExtension,
      );
    }
    return foreignDocument;
  }

  /**
   * Create a foreign document from input language and file extension.
   *
   * @param  language - the required language
   * @param  standalone - the document type is supported natively by LSP?
   * @param  fileExtension - File extension.
   */
  protected openForeign(
    language: language,
    standalone: boolean,
    fileExtension: string,
  ): VirtualDocument {
    const document = this.factory({
      ...this.options,
      parent: this,
      standalone: standalone,
      fileExtension: fileExtension,
      language: language,
    });
    const context: Document.IForeignContext = {
      foreignDocument: document,
      parentHost: this,
    };
    this._foreignDocumentOpened.fire(context);
    // pass through any future signals
    document.foreignDocumentClosed(() => this.forwardClosedSignal(context));
    document.foreignDocumentOpened(() => this.forwardOpenedSignal(context));

    this.foreignDocuments.set(document.virtualId, document);

    return document;
  }

  /**
   * Forward the closed signal from the foreign document to the host document's
   * signal
   */
  protected forwardClosedSignal(context: Document.IForeignContext) {
    this._foreignDocumentClosed.fire(context);
  }

  /**
   * Forward the opened signal from the foreign document to the host document's
   * signal
   */
  protected forwardOpenedSignal(context: Document.IForeignContext) {
    this._foreignDocumentOpened.fire(context);
  }

  /**
   * Slot of the `updateBegan` signal.
   */
  protected _updateBeganSlot(): void {
    this._editorToSourceLineNew = new Map();
  }

  /**
   * Slot of the `blockAdded` signal.
   */
  protected _blockAddedSlot(blockData: IBlockAddedInfo): void {
    this._editorToSourceLineNew.set(
      blockData.block.ceEditor,
      blockData.virtualDocument.lastSourceLine,
    );
  }

  /**
   * Slot of the `updateFinished` signal.
   */
  protected _updateFinishedSlot(): void {
    this._editorToSourceLine = this._editorToSourceLineNew;
  }

  protected _foreignDocumentClosed = new Emitter<Document.IForeignContext>();
  protected _foreignDocumentOpened = new Emitter<Document.IForeignContext>();
  protected _changed = new Emitter<VirtualDocument>();
}

export namespace VirtualDocument {
  /**
   * Identifier composed of `virtual_id`s of a nested structure of documents,
   * used to aide assignment of the connection to the virtual document
   * handling specific, nested language usage; it will be appended to the file name
   * when creating a connection.
   */
  export type idPath = string;
  /**
   * Instance identifier for standalone documents (snippets), or language identifier
   * for documents which should be interpreted as one when stretched across cells.
   */
  export type virtualId = string;
  /**
   * Identifier composed of the file path and id_path.
   */
  export type uri = string;
}

/**
 * Create foreign documents if available from input virtual documents.
 * @param virtualDocument - the virtual document to be collected
 * @return - Set of generated foreign documents
 */
export function collectDocuments(
  virtualDocument: VirtualDocument,
): Set<VirtualDocument> {
  const collected = new Set<VirtualDocument>();
  collected.add(virtualDocument);
  for (const foreign of virtualDocument.foreignDocuments.values()) {
    const foreignLanguages = collectDocuments(foreign);
    foreignLanguages.forEach(collected.add, collected);
  }
  return collected;
}

export interface IBlockAddedInfo {
  /**
   * The virtual document.
   */
  virtualDocument: VirtualDocument;

  /**
   * Option of the code block.
   */
  block: Document.ICodeBlockOptions;
}

export class UpdateManager implements Disposable {
  // eslint-disable-next-line @typescript-eslint/parameter-properties, @typescript-eslint/no-parameter-properties
  constructor(protected virtualDocument: VirtualDocument) {
    this._blockAdded = new Emitter<IBlockAddedInfo>();
    this._documentUpdated = new Emitter<VirtualDocument>();
    this._updateBegan = new Emitter<Document.ICodeBlockOptions[]>();
    this._updateFinished = new Emitter<Document.ICodeBlockOptions[]>();
    this.documentUpdated(this._onUpdated);
  }

  /**
   * Promise resolved when the updating process finishes.
   */
  get updateDone(): Promise<void> {
    return this._updateDone;
  }
  /**
   * Test whether the document is disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Signal emitted when a code block is added to the document.
   */
  get blockAdded(): Event<IBlockAddedInfo> {
    return this._blockAdded.event;
  }

  /**
   * Signal emitted by the editor that triggered the update,
   * providing the root document of the updated documents.
   */
  get documentUpdated(): Event<VirtualDocument> {
    return this._documentUpdated.event;
  }

  /**
   * Signal emitted when the update is started
   */
  get updateBegan(): Event<Document.ICodeBlockOptions[]> {
    return this._updateBegan.event;
  }

  /**
   * Signal emitted when the update is finished
   */
  get updateFinished(): Event<Document.ICodeBlockOptions[]> {
    return this._updateFinished.event;
  }

  /**
   * Dispose the class
   */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
  }

  /**
   * Execute provided callback within an update-locked context, which guarantees that:
   *  - the previous updates must have finished before the callback call, and
   *  - no update will happen when executing the callback
   * @param fn - the callback to execute in update lock
   */
  async withUpdateLock(fn: () => void): Promise<void> {
    await untilReady(() => this._canUpdate(), 12, 10).then(() => {
      try {
        this._updateLock = true;
        fn();
      } catch (ex) {
        console.error(ex);
      } finally {
        this._updateLock = false;
      }
      return;
    });
  }

  /**
   * Update all the virtual documents, emit documents updated with root document if succeeded,
   * and resolve a void promise. The promise does not contain the text value of the root document,
   * as to avoid an easy trap of ignoring the changes in the virtual documents.
   */
  async updateDocuments(blocks: Document.ICodeBlockOptions[]): Promise<void> {
    const update = new Promise<void>((resolve, reject) => {
      // defer the update by up to 50 ms (10 retrials * 5 ms break),
      // awaiting for the previous update to complete.
      untilReady(() => this._canUpdate(), 10, 5)
        .then(() => {
          if (this.isDisposed || !this.virtualDocument) {
            resolve();
          }
          try {
            this._isUpdateInProgress = true;
            this._updateBegan.fire(blocks);

            this.virtualDocument.clear();

            for (const codeBlock of blocks) {
              this._blockAdded.fire({
                block: codeBlock,
                virtualDocument: this.virtualDocument,
              });
              this.virtualDocument.appendCodeBlock(codeBlock);
            }

            this._updateFinished.fire(blocks);

            if (this.virtualDocument) {
              this._documentUpdated.fire(this.virtualDocument);
              this.virtualDocument.maybeEmitChanged();
            }

            resolve();
          } catch (e) {
            console.warn('Documents update failed:', e);
            reject(e);
          } finally {
            this._isUpdateInProgress = false;
          }
          return;
        })
        .catch(console.error);
    });
    this._updateDone = update;
    return update;
  }

  protected _isDisposed = false;

  /**
   * Promise resolved when the updating process finishes.
   */
  protected _updateDone: Promise<void> = new Promise<void>((resolve) => {
    resolve();
  });

  /**
   * Virtual documents update guard.
   */
  protected _isUpdateInProgress = false;

  /**
   * Update lock to prevent multiple updates are applied at the same time.
   */
  protected _updateLock = false;

  protected _blockAdded: Emitter<IBlockAddedInfo>;
  protected _documentUpdated: Emitter<VirtualDocument>;
  protected _updateBegan: Emitter<Document.ICodeBlockOptions[]>;
  protected _updateFinished: Emitter<Document.ICodeBlockOptions[]>;

  /**
   * Once all the foreign documents were refreshed, the unused documents (and their connections)
   * should be terminated if their lifetime has expired.
   */
  protected _onUpdated(rootDocument: VirtualDocument) {
    try {
      rootDocument.closeExpiredDocuments();
    } catch (e) {
      console.warn('Failed to close expired documents');
    }
  }

  /**
   * Check if the document can be updated.
   */
  protected _canUpdate() {
    return !this.isDisposed && !this._isUpdateInProgress && !this._updateLock;
  }
}
