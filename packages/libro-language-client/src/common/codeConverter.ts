/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as proto from '@difizen/vscode-languageserver-protocol';
import type { LocationLink } from 'vscode';
import type {
  InlineCompletionContext,
  InlayHint,
  CallHierarchyItem,
  TypeHierarchyItem,
  DocumentLink,
  FileWillCreateEvent,
  FileWillRenameEvent,
  FileWillDeleteEvent,
  ParameterInformation,
  SignatureInformation,
  SignatureHelp,
  DiagnosticRelatedInformation,
  MarkdownString,
  CompletionItemKind,
  CodeActionKind,
  SelectedCompletionInfo,
  InlayHintLabelPart,
  CancellationToken,
  CodeAction,
  CodeActionContext,
  CodeLens,
  Command,
  CompletionContext,
  CompletionItem,
  Diagnostic,
  FileCreateEvent,
  FileDeleteEvent,
  FileRenameEvent,
  FormattingOptions,
  InlineValueContext,
  Location,
  Position,
  Range,
  SignatureHelpContext,
  SymbolTag,
  TextDocument,
  TextDocumentChangeEvent,
  TextDocumentWillSaveEvent,
  TextEdit,
  Uri,
  SymbolInformation as VSymbolInformation,
  Definition,
  DefinitionLink,
} from 'vscode';

import ProtocolCallHierarchyItem from './protocolCallHierarchyItem.js';
import ProtocolCodeAction from './protocolCodeAction.js';
import ProtocolCodeLens from './protocolCodeLens.js';
import ProtocolCompletionItem from './protocolCompletionItem.js';
import { DiagnosticCode } from './protocolDiagnostic.js';
import { ProtocolDiagnostic } from './protocolDiagnostic.js';
import ProtocolDocumentLink from './protocolDocumentLink.js';
import ProtocolInlayHint from './protocolInlayHint.js';
import ProtocolTypeHierarchyItem from './protocolTypeHierarchyItem.js';
import WorkspaceSymbol from './protocolWorkspaceSymbol.js';
import * as async from './utils/async.js';
import * as Is from './utils/is.js';
import { isNumber } from './vscodeAdaptor/hostTypeUtil.js';
import type { SymbolInformation } from './vscodeAdaptor/vscodeAdaptor.js';
import {
  SymbolKind,
  TextDocumentSaveReason,
  DiagnosticSeverity,
  DiagnosticTag,
} from './vscodeAdaptor/vscodeAdaptor.js';
import { CompletionTriggerKind } from './vscodeAdaptor/vscodeAdaptor.js';
import { SignatureHelpTriggerKind } from './vscodeAdaptor/vscodeAdaptor.js';
import { CompletionItemTag, SnippetString } from './vscodeAdaptor/vscodeAdaptor.js';
import { CodeActionTriggerKind } from './vscodeAdaptor/vscodeAdaptor.js';
import { InlineCompletionTriggerKind } from './vscodeAdaptor/vscodeAdaptor.js';

interface InsertReplaceRange {
  inserting: Range;
  replacing: Range;
}

namespace InsertReplaceRange {
  export function is(value: Range | InsertReplaceRange): value is InsertReplaceRange {
    const candidate = value as InsertReplaceRange;
    return candidate && !!candidate.inserting && !!candidate.replacing;
  }
}

export interface FileFormattingOptions {
  trimTrailingWhitespace?: boolean;
  trimFinalNewlines?: boolean;
  insertFinalNewline?: boolean;
}

export interface Converter {
  asUri(uri: Uri): string;

  asTextDocumentItem(textDocument: TextDocument): proto.TextDocumentItem;

  asTextDocumentIdentifier(textDocument: TextDocument): proto.TextDocumentIdentifier;

  asVersionedTextDocumentIdentifier(
    textDocument: TextDocument,
  ): proto.VersionedTextDocumentIdentifier;

  asOpenTextDocumentParams(textDocument: TextDocument): proto.DidOpenTextDocumentParams;

  asChangeTextDocumentParams(
    textDocument: TextDocument,
  ): proto.DidChangeTextDocumentParams;
  asChangeTextDocumentParams(
    event: TextDocumentChangeEvent,
    uri: Uri,
    version: number,
  ): proto.DidChangeTextDocumentParams;

  asCloseTextDocumentParams(
    textDocument: TextDocument,
  ): proto.DidCloseTextDocumentParams;

  asSaveTextDocumentParams(
    textDocument: TextDocument,
    includeContent?: boolean,
  ): proto.DidSaveTextDocumentParams;
  asWillSaveTextDocumentParams(
    event: TextDocumentWillSaveEvent,
  ): proto.WillSaveTextDocumentParams;

  asDidCreateFilesParams(event: FileCreateEvent): proto.CreateFilesParams;
  asDidRenameFilesParams(event: FileRenameEvent): proto.RenameFilesParams;
  asDidDeleteFilesParams(event: FileDeleteEvent): proto.DeleteFilesParams;
  asWillCreateFilesParams(event: FileCreateEvent): proto.CreateFilesParams;
  asWillRenameFilesParams(event: FileRenameEvent): proto.RenameFilesParams;
  asWillDeleteFilesParams(event: FileDeleteEvent): proto.DeleteFilesParams;

  asTextDocumentPositionParams(
    textDocument: TextDocument,
    position: Position,
  ): proto.TextDocumentPositionParams;

  asCompletionParams(
    textDocument: TextDocument,
    position: Position,
    context: CompletionContext,
  ): proto.CompletionParams;

  asSignatureHelpParams(
    textDocument: TextDocument,
    position: Position,
    context: SignatureHelpContext,
  ): proto.SignatureHelpParams;

  asWorkerPosition(position: Position): proto.Position;

  asPosition(value: null): null;
  asPosition(value: undefined): undefined;
  asPosition(value: Position): proto.Position;
  asPosition(value: Position | undefined | null): proto.Position | undefined | null;

  asPositions(
    value: readonly Position[],
    token?: CancellationToken,
  ): Promise<proto.Position[]>;
  asPositionsSync(
    value: readonly Position[],
    token?: CancellationToken,
  ): proto.Position[];

  asRange(value: null): null;
  asRange(value: undefined): undefined;
  asRange(value: Range): proto.Range;
  asRange(value: Range | undefined | null): proto.Range | undefined | null;

  asRanges(values: readonly Range[]): proto.Range[];

  asDefinitionResult(item: Definition): proto.Definition;
  asDefinitionResult(item: DefinitionLink[]): proto.Definition;
  asDefinitionResult(item: undefined | null): undefined;
  asDefinitionResult(
    item: Definition | DefinitionLink[] | undefined | null,
  ): proto.Definition | undefined;
  asDefinitionResult(
    item: Definition | DefinitionLink[] | undefined | null,
  ): proto.Definition | undefined;

  asLocation(value: null): null;
  asLocation(value: undefined): undefined;
  asLocation(value: Location): proto.Location;
  asLocation(value: Location | undefined | null): proto.Location | undefined | null;

  asLocationLink(item: undefined | null): undefined;
  asLocationLink(item: LocationLink): proto.LocationLink;
  asLocationLink(item: LocationLink | undefined | null): proto.LocationLink | undefined;

  asDiagnosticSeverity(value: DiagnosticSeverity): number;
  asDiagnosticTag(value: DiagnosticTag): number | undefined;

  asDiagnostic(item: Diagnostic): proto.Diagnostic;

  asDiagnostics(
    items: Diagnostic[],
    token?: CancellationToken,
  ): Promise<proto.Diagnostic[]>;
  asDiagnosticsSync(items: Diagnostic[]): proto.Diagnostic[];

  asCompletionItem(
    item: CompletionItem,
    labelDetailsSupport?: boolean,
  ): proto.CompletionItem;

  asSymbolKind(item: SymbolKind): proto.SymbolKind;

  asSymbolTag(item: SymbolTag): proto.SymbolTag;
  asSymbolTags(items: ReadonlyArray<SymbolTag>): proto.SymbolTag[];

  asTextEdit(edit: TextEdit): proto.TextEdit;

  asReferenceParams(
    textDocument: TextDocument,
    position: Position,
    options: { includeDeclaration: boolean },
  ): proto.ReferenceParams;

  asCodeAction(item: CodeAction, token?: CancellationToken): Promise<proto.CodeAction>;
  asCodeActionSync(item: CodeAction): proto.CodeAction;

  asCodeActionContext(
    context: CodeActionContext,
    token?: CancellationToken,
  ): Promise<proto.CodeActionContext>;
  asCodeActionContextSync(context: CodeActionContext): proto.CodeActionContext;

  asCodeActionList(actions: (Command | CodeAction)[]): Promise<proto.CodeAction[]>;

  asInlineValueContext(context: InlineValueContext): proto.InlineValueContext;

  asCommand(item: Command): proto.Command;

  asCodeLens(item: CodeLens): proto.CodeLens;

  asFormattingOptions(
    options: FormattingOptions,
    fileOptions: FileFormattingOptions,
  ): proto.FormattingOptions;

  asDocumentSymbolParams(textDocument: TextDocument): proto.DocumentSymbolParams;

  asCodeLensParams(textDocument: TextDocument): proto.CodeLensParams;

  asDocumentLink(item: DocumentLink): proto.DocumentLink;

  asDocumentLinkParams(textDocument: TextDocument): proto.DocumentLinkParams;

  asCallHierarchyItem(value: CallHierarchyItem): proto.CallHierarchyItem;

  asTypeHierarchyItem(value: TypeHierarchyItem): proto.TypeHierarchyItem;

  asWorkspaceSymbol(item: VSymbolInformation): proto.WorkspaceSymbol;

  asInlayHint(value: InlayHint): proto.InlayHint;

  asInlineCompletionParams(
    document: TextDocument,
    position: Position,
    context: InlineCompletionContext,
  ): proto.InlineCompletionParams;
  asInlineCompletionContext(
    context: InlineCompletionContext,
  ): proto.InlineCompletionContext;

  asSignatureHelpResult(item: undefined | null): undefined;
  asSignatureHelpResult(item: SignatureHelp): proto.SignatureHelp;
  asSignatureHelpResult(
    item: SignatureHelp | undefined | null,
  ): proto.SignatureHelp | undefined;
  asSignatureHelpResult(
    item: SignatureHelp | undefined | null,
  ): proto.SignatureHelp | undefined;
}

export interface URIConverter {
  (value: Uri): string;
}

export function createConverter(uriConverter?: URIConverter): Converter {
  const nullConverter = (value: Uri) => value.toString();

  const _uriConverter: URIConverter = uriConverter || nullConverter;

  function asUri(value: Uri): string {
    return _uriConverter(value);
  }

  function asTextDocumentIdentifier(
    textDocument: TextDocument,
  ): proto.TextDocumentIdentifier {
    return {
      uri: _uriConverter(textDocument.uri),
    };
  }

  function asTextDocumentItem(textDocument: TextDocument): proto.TextDocumentItem {
    return {
      uri: _uriConverter(textDocument.uri),
      languageId: textDocument.languageId,
      version: textDocument.version,
      text: textDocument.getText(),
    };
  }

  function asVersionedTextDocumentIdentifier(
    textDocument: TextDocument,
  ): proto.VersionedTextDocumentIdentifier {
    return {
      uri: _uriConverter(textDocument.uri),
      version: textDocument.version,
    };
  }

  function asOpenTextDocumentParams(
    textDocument: TextDocument,
  ): proto.DidOpenTextDocumentParams {
    return {
      textDocument: asTextDocumentItem(textDocument),
    };
  }

  function isTextDocumentChangeEvent(value: any): value is TextDocumentChangeEvent {
    const candidate = value as TextDocumentChangeEvent;
    return !!candidate.document && !!candidate.contentChanges;
  }

  function isTextDocument(value: any): value is TextDocument {
    const candidate = value as TextDocument;
    return !!candidate.uri && !!candidate.version;
  }

  function asChangeTextDocumentParams(
    textDocument: TextDocument,
  ): proto.DidChangeTextDocumentParams;
  function asChangeTextDocumentParams(
    event: TextDocumentChangeEvent,
    uri: Uri,
    version: number,
  ): proto.DidChangeTextDocumentParams;
  function asChangeTextDocumentParams(
    arg0: TextDocumentChangeEvent | TextDocument,
    arg1?: Uri,
    arg2?: number,
  ): proto.DidChangeTextDocumentParams {
    if (isTextDocument(arg0)) {
      const result: proto.DidChangeTextDocumentParams = {
        textDocument: {
          uri: _uriConverter(arg0.uri),
          version: arg0.version,
        },
        contentChanges: [{ text: arg0.getText() }],
      };
      return result;
    } else if (isTextDocumentChangeEvent(arg0)) {
      const uri: Uri = arg1!;
      const version: number = arg2!;
      const result: proto.DidChangeTextDocumentParams = {
        textDocument: {
          uri: _uriConverter(uri),
          version: version,
        },
        contentChanges: arg0.contentChanges.map(
          (change): proto.TextDocumentContentChangeEvent => {
            const range = change.range;
            return {
              range: {
                start: { line: range.start.line, character: range.start.character },
                end: { line: range.end.line, character: range.end.character },
              },
              rangeLength: change.rangeLength,
              text: change.text,
            };
          },
        ),
      };
      return result;
    } else {
      throw Error('Unsupported text document change parameter');
    }
  }

  function asCloseTextDocumentParams(
    textDocument: TextDocument,
  ): proto.DidCloseTextDocumentParams {
    return {
      textDocument: asTextDocumentIdentifier(textDocument),
    };
  }

  function asSaveTextDocumentParams(
    textDocument: TextDocument,
    includeContent = false,
  ): proto.DidSaveTextDocumentParams {
    const result: proto.DidSaveTextDocumentParams = {
      textDocument: asTextDocumentIdentifier(textDocument),
    };
    if (includeContent) {
      result.text = textDocument.getText();
    }
    return result;
  }

  function asTextDocumentSaveReason(reason: TextDocumentSaveReason): 1 | 2 | 3 {
    switch (reason) {
      case TextDocumentSaveReason.Manual:
        return proto.TextDocumentSaveReason.Manual;
      case TextDocumentSaveReason.AfterDelay:
        return proto.TextDocumentSaveReason.AfterDelay;
      case TextDocumentSaveReason.FocusOut:
        return proto.TextDocumentSaveReason.FocusOut;
    }
    return proto.TextDocumentSaveReason.Manual;
  }

  function asWillSaveTextDocumentParams(
    event: TextDocumentWillSaveEvent,
  ): proto.WillSaveTextDocumentParams {
    return {
      textDocument: asTextDocumentIdentifier(event.document),
      reason: asTextDocumentSaveReason(event.reason),
    };
  }

  function asDidCreateFilesParams(event: FileCreateEvent): proto.CreateFilesParams {
    return {
      files: event.files.map((fileUri) => ({
        uri: _uriConverter(fileUri),
      })),
    };
  }

  function asDidRenameFilesParams(event: FileRenameEvent): proto.RenameFilesParams {
    return {
      files: event.files.map((file) => ({
        oldUri: _uriConverter(file.oldUri),
        newUri: _uriConverter(file.newUri),
      })),
    };
  }

  function asDidDeleteFilesParams(event: FileDeleteEvent): proto.DeleteFilesParams {
    return {
      files: event.files.map((fileUri) => ({
        uri: _uriConverter(fileUri),
      })),
    };
  }

  function asWillCreateFilesParams(
    event: FileWillCreateEvent,
  ): proto.CreateFilesParams {
    return {
      files: event.files.map((fileUri) => ({
        uri: _uriConverter(fileUri),
      })),
    };
  }

  function asWillRenameFilesParams(
    event: FileWillRenameEvent,
  ): proto.RenameFilesParams {
    return {
      files: event.files.map((file) => ({
        oldUri: _uriConverter(file.oldUri),
        newUri: _uriConverter(file.newUri),
      })),
    };
  }

  function asWillDeleteFilesParams(
    event: FileWillDeleteEvent,
  ): proto.DeleteFilesParams {
    return {
      files: event.files.map((fileUri) => ({
        uri: _uriConverter(fileUri),
      })),
    };
  }

  function asTextDocumentPositionParams(
    textDocument: TextDocument,
    position: Position,
  ): proto.TextDocumentPositionParams {
    return {
      textDocument: asTextDocumentIdentifier(textDocument),
      position: asWorkerPosition(position),
    };
  }

  function asCompletionTriggerKind(
    triggerKind: CompletionTriggerKind,
  ): proto.CompletionTriggerKind {
    switch (triggerKind) {
      case CompletionTriggerKind.TriggerCharacter:
        return proto.CompletionTriggerKind.TriggerCharacter;
      case CompletionTriggerKind.TriggerForIncompleteCompletions:
        return proto.CompletionTriggerKind.TriggerForIncompleteCompletions;
      default:
        return proto.CompletionTriggerKind.Invoked;
    }
  }

  function asCompletionParams(
    textDocument: TextDocument,
    position: Position,
    context: CompletionContext,
  ): proto.CompletionParams {
    return {
      textDocument: asTextDocumentIdentifier(textDocument),
      position: asWorkerPosition(position),
      context: {
        triggerKind: asCompletionTriggerKind(context.triggerKind),
        triggerCharacter: context.triggerCharacter,
      },
    };
  }

  function asSignatureHelpTriggerKind(
    triggerKind: SignatureHelpTriggerKind,
  ): proto.SignatureHelpTriggerKind {
    switch (triggerKind) {
      case SignatureHelpTriggerKind.Invoke:
        return proto.SignatureHelpTriggerKind.Invoked;
      case SignatureHelpTriggerKind.TriggerCharacter:
        return proto.SignatureHelpTriggerKind.TriggerCharacter;
      case SignatureHelpTriggerKind.ContentChange:
        return proto.SignatureHelpTriggerKind.ContentChange;
    }
  }

  function asParameterInformation(
    value: ParameterInformation,
  ): proto.ParameterInformation {
    // We leave the documentation out on purpose since it usually adds no
    // value for the server.
    return {
      label: value.label,
    };
  }

  function asParameterInformations(
    values: ParameterInformation[],
  ): proto.ParameterInformation[] {
    return values.map(asParameterInformation);
  }

  function asSignatureInformation(
    value: SignatureInformation,
  ): proto.SignatureInformation {
    // We leave the documentation out on purpose since it usually adds no
    // value for the server.
    return {
      label: value.label,
      parameters: asParameterInformations(value.parameters),
    };
  }

  function asSignatureInformations(
    values: SignatureInformation[],
  ): proto.SignatureInformation[] {
    return values.map(asSignatureInformation);
  }

  function asSignatureHelp(
    value: SignatureHelp | undefined,
  ): proto.SignatureHelp | undefined {
    if (value === undefined) {
      return value;
    }
    return {
      signatures: asSignatureInformations(value.signatures),
      activeSignature: value.activeSignature,
      activeParameter: value.activeParameter,
    };
  }

  function asSignatureHelpParams(
    textDocument: TextDocument,
    position: Position,
    context: SignatureHelpContext,
  ): proto.SignatureHelpParams {
    return {
      textDocument: asTextDocumentIdentifier(textDocument),
      position: asWorkerPosition(position),
      context: {
        isRetrigger: context.isRetrigger,
        triggerCharacter: context.triggerCharacter,
        triggerKind: asSignatureHelpTriggerKind(context.triggerKind),
        activeSignatureHelp: asSignatureHelp(context.activeSignatureHelp),
      },
    };
  }

  function asWorkerPosition(position: Position): proto.Position {
    return { line: position.line, character: position.character };
  }

  function asPosition(value: null): null;
  function asPosition(value: undefined): undefined;
  function asPosition(value: Position): proto.Position;
  function asPosition(
    value: Position | undefined | null,
  ): proto.Position | undefined | null;
  function asPosition(
    value: Position | undefined | null,
  ): proto.Position | undefined | null {
    if (value === undefined || value === null) {
      return value;
    }
    return {
      line:
        value.line > proto.uinteger.MAX_VALUE ? proto.uinteger.MAX_VALUE : value.line,
      character:
        value.character > proto.uinteger.MAX_VALUE
          ? proto.uinteger.MAX_VALUE
          : value.character,
    };
  }

  function asPositions(
    values: readonly Position[],
    token?: CancellationToken,
  ): Promise<proto.Position[]> {
    return async.map(values, asPosition as (item: Position) => proto.Position, token);
  }

  function asPositionsSync(values: readonly Position[]): proto.Position[] {
    return values.map(asPosition as (item: Position) => proto.Position);
  }

  function asRange(value: Range): proto.Range;
  function asRange(value: undefined): undefined;
  function asRange(value: null): null;
  function asRange(value: Range | undefined | null): proto.Range | undefined | null;
  function asRange(value: Range | undefined | null): proto.Range | undefined | null {
    if (value === undefined || value === null) {
      return value;
    }
    return { start: asPosition(value.start), end: asPosition(value.end) };
  }

  function asRanges(values: readonly Range[]): proto.Range[] {
    return values.map(asRange as (item: Range) => proto.Range);
  }

  function asLocationLink(item: undefined | null): undefined;
  function asLocationLink(item: LocationLink): proto.LocationLink;
  function asLocationLink(
    item: LocationLink | undefined | null,
  ): proto.LocationLink | undefined {
    if (!item) {
      return undefined;
    }
    const result: proto.LocationLink = {
      targetUri: item.targetUri.toString(),
      targetRange: asRange(item.targetSelectionRange)!, // See issue: https://github.com/Microsoft/vscode/issues/58649
      originSelectionRange: asRange(item.originSelectionRange)!,
      targetSelectionRange: asRange(item.targetSelectionRange)!,
    };
    if (!result.targetSelectionRange) {
      throw new Error(`targetSelectionRange must not be undefined or null`);
    }
    return result;
  }

  // Function to check if an object is a LocationLink
  function isLocationLink(object: any): object is LocationLink {
    return (
      object !== undefined &&
      'targetUri' in object &&
      'targetRange' in object &&
      'targetSelectionRange' in object
    );
  }

  function asDefinitionResult(item: Definition): proto.Definition;
  function asDefinitionResult(item: DefinitionLink[]): proto.Definition;
  function asDefinitionResult(item: undefined | null): undefined;
  function asDefinitionResult(
    item: Definition | DefinitionLink[] | undefined | null,
  ): proto.Definition | proto.DefinitionLink[] | undefined;
  function asDefinitionResult(
    item: Definition | DefinitionLink[] | undefined | null,
  ): proto.Definition | proto.DefinitionLink[] | undefined {
    if (!item) {
      return undefined;
    }
    if (Array.isArray(item)) {
      if (item.length === 0) {
        return undefined;
      } else if (isLocationLink(item[0])) {
        const links: LocationLink[] = item as unknown as LocationLink[];
        return links.map((location) => asLocationLink(location));
      } else {
        const locations: Location[] = item as Location[];
        return locations.map((location) => asLocation(location));
      }
    } else {
      return asLocation(item);
    }
  }

  function asLocation(value: Location): proto.Location;
  function asLocation(value: undefined): undefined;
  function asLocation(value: null): null;
  function asLocation(
    value: Location | undefined | null,
  ): proto.Location | undefined | null {
    if (value === undefined || value === null) {
      return value;
    }
    return proto.Location.create(asUri(value.uri), asRange(value.range));
  }

  function asDiagnosticSeverity(value: DiagnosticSeverity): proto.DiagnosticSeverity {
    switch (value) {
      case DiagnosticSeverity.Error:
        return proto.DiagnosticSeverity.Error;
      case DiagnosticSeverity.Warning:
        return proto.DiagnosticSeverity.Warning;
      case DiagnosticSeverity.Information:
        return proto.DiagnosticSeverity.Information;
      case DiagnosticSeverity.Hint:
        return proto.DiagnosticSeverity.Hint;
    }
  }

  function asDiagnosticTags(tags: undefined | null): undefined;
  function asDiagnosticTags(tags: DiagnosticTag[]): proto.DiagnosticTag[];
  function asDiagnosticTags(
    tags: DiagnosticTag[] | undefined | null,
  ): proto.DiagnosticTag[] | undefined;
  function asDiagnosticTags(
    tags: DiagnosticTag[] | undefined | null,
  ): proto.DiagnosticTag[] | undefined {
    if (!tags) {
      return undefined;
    }
    const result: DiagnosticTag[] = [];
    for (const tag of tags) {
      const converted = asDiagnosticTag(tag);
      if (converted !== undefined) {
        result.push(converted);
      }
    }
    return result.length > 0 ? result : undefined;
  }

  function asDiagnosticTag(tag: DiagnosticTag): proto.DiagnosticTag | undefined {
    switch (tag) {
      case DiagnosticTag.Unnecessary:
        return proto.DiagnosticTag.Unnecessary;
      case DiagnosticTag.Deprecated:
        return proto.DiagnosticTag.Deprecated;
      default:
        return undefined;
    }
  }

  function asRelatedInformation(
    item: DiagnosticRelatedInformation,
  ): proto.DiagnosticRelatedInformation {
    return {
      message: item.message,
      location: asLocation(item.location),
    };
  }

  function asRelatedInformations(
    items: DiagnosticRelatedInformation[],
  ): proto.DiagnosticRelatedInformation[] {
    return items.map(asRelatedInformation);
  }

  function asDiagnosticCode(
    value: number | string | { value: string | number; target: Uri } | undefined | null,
  ): number | string | DiagnosticCode | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (Is.number(value) || Is.string(value)) {
      return value;
    }
    return { value: value.value, target: asUri(value.target) };
  }

  function asDiagnostic(item: Diagnostic): proto.Diagnostic {
    const result: proto.Diagnostic = proto.Diagnostic.create(
      asRange(item.range),
      item.message,
    );
    const protocolDiagnostic: ProtocolDiagnostic | undefined =
      item instanceof ProtocolDiagnostic ? item : undefined;
    if (protocolDiagnostic !== undefined && protocolDiagnostic.data !== undefined) {
      result.data = protocolDiagnostic.data;
    }
    const code = asDiagnosticCode(item.code);
    if (DiagnosticCode.is(code)) {
      if (protocolDiagnostic !== undefined && protocolDiagnostic.hasDiagnosticCode) {
        (result.code as unknown as DiagnosticCode) = code;
      } else {
        result.code = code.value;
        result.codeDescription = { href: code.target };
      }
    } else {
      result.code = code;
    }
    if (Is.number(item.severity)) {
      result.severity = asDiagnosticSeverity(item.severity);
    }
    if (Array.isArray(item.tags)) {
      result.tags = asDiagnosticTags(item.tags);
    }
    if (item.relatedInformation) {
      result.relatedInformation = asRelatedInformations(item.relatedInformation);
    }
    if (item.source) {
      result.source = item.source;
    }
    return result;
  }

  function asDiagnostics(
    items: ReadonlyArray<Diagnostic>,
    token?: CancellationToken,
  ): Promise<proto.Diagnostic[]> {
    if (items === undefined || items === null) {
      return items;
    }
    return async.map(items, asDiagnostic, token);
  }

  function asDiagnosticsSync(items: ReadonlyArray<Diagnostic>): proto.Diagnostic[] {
    if (items === undefined || items === null) {
      return items;
    }
    return items.map(asDiagnostic);
  }

  function asDocumentation(
    format: string,
    documentation: string | MarkdownString,
  ): string | proto.MarkupContent {
    switch (format) {
      case '$string':
        return documentation as string;
      case proto.MarkupKind.PlainText:
        return { kind: format, value: documentation as string };
      case proto.MarkupKind.Markdown:
        return { kind: format, value: (documentation as MarkdownString).value };
      default:
        return `Unsupported Markup content received. Kind is: ${format}`;
    }
  }

  function asCompletionItemTag(
    tag: CompletionItemTag,
  ): proto.CompletionItemTag | undefined {
    switch (tag) {
      case CompletionItemTag.Deprecated:
        return proto.CompletionItemTag.Deprecated;
    }
    return undefined;
  }

  function asCompletionItemTags(
    tags: ReadonlyArray<CompletionItemTag> | undefined,
  ): proto.CompletionItemTag[] | undefined {
    if (tags === undefined) {
      return tags;
    }
    const result: proto.CompletionItemTag[] = [];
    for (const tag of tags) {
      const converted = asCompletionItemTag(tag);
      if (converted !== undefined) {
        result.push(converted);
      }
    }
    return result;
  }

  function asCompletionItemKind(
    value: CompletionItemKind,
    original: proto.CompletionItemKind | undefined,
  ): proto.CompletionItemKind {
    if (original !== undefined) {
      return original;
    }
    return (value + 1) as proto.CompletionItemKind;
  }

  function asCompletionItem(
    item: CompletionItem,
    labelDetailsSupport = false,
  ): proto.CompletionItem {
    let label: string;
    let labelDetails: proto.CompletionItemLabelDetails | undefined;
    if (Is.string(item.label)) {
      label = item.label;
    } else {
      label = item.label.label;
      if (
        labelDetailsSupport &&
        (item.label.detail !== undefined || item.label.description !== undefined)
      ) {
        labelDetails = {
          detail: item.label.detail,
          description: item.label.description,
        };
      }
    }
    const result: proto.CompletionItem = { label: label };
    if (labelDetails !== undefined) {
      result.labelDetails = labelDetails;
    }
    const protocolItem =
      item instanceof ProtocolCompletionItem
        ? (item as ProtocolCompletionItem)
        : undefined;
    if (item.detail) {
      result.detail = item.detail;
    }
    // We only send items back we created. So this can't be something else than
    // a string right now.
    if (item.documentation) {
      if (!protocolItem || protocolItem.documentationFormat === '$string') {
        result.documentation = item.documentation as string;
      } else {
        result.documentation = asDocumentation(
          protocolItem.documentationFormat!,
          item.documentation,
        );
      }
    }
    if (item.filterText) {
      result.filterText = item.filterText;
    }
    fillPrimaryInsertText(result, item as ProtocolCompletionItem);
    if (Is.number(item.kind)) {
      result.kind = asCompletionItemKind(
        item.kind,
        protocolItem && protocolItem.originalItemKind,
      );
    }
    if (item.sortText) {
      result.sortText = item.sortText;
    }
    if (item.additionalTextEdits) {
      result.additionalTextEdits = asTextEdits(item.additionalTextEdits);
    }
    if (item.commitCharacters) {
      result.commitCharacters = item.commitCharacters.slice();
    }
    if (item.command) {
      result.command = asCommand(item.command);
    }
    if (item.preselect === true || item.preselect === false) {
      result.preselect = item.preselect;
    }
    const tags = asCompletionItemTags(item.tags);
    if (protocolItem) {
      if (protocolItem.data !== undefined) {
        result.data = protocolItem.data;
      }
      if (protocolItem.deprecated === true || protocolItem.deprecated === false) {
        if (protocolItem.deprecated === true && tags !== undefined && tags.length > 0) {
          const index = tags.indexOf(CompletionItemTag.Deprecated);
          if (index !== -1) {
            tags.splice(index, 1);
          }
        }
        result.deprecated = protocolItem.deprecated;
      }
      if (protocolItem.insertTextMode !== undefined) {
        result.insertTextMode = protocolItem.insertTextMode;
      }
    }
    if (tags !== undefined && tags.length > 0) {
      result.tags = tags;
    }
    if (result.insertTextMode === undefined && item.keepWhitespace === true) {
      result.insertTextMode = proto.InsertTextMode.adjustIndentation;
    }
    return result;
  }

  function fillPrimaryInsertText(
    target: proto.CompletionItem,
    source: ProtocolCompletionItem,
  ): void {
    let format: proto.InsertTextFormat = proto.InsertTextFormat.PlainText;
    let text: string | undefined = undefined;
    let range: Range | InsertReplaceRange | undefined = undefined;
    if (source.textEdit) {
      text = source.textEdit.newText;
      range = source.textEdit.range;
    } else if (source.insertText instanceof SnippetString) {
      format = proto.InsertTextFormat.Snippet;
      text = source.insertText.value;
    } else {
      text = source.insertText;
    }
    if (source.range) {
      range = source.range;
    }

    target.insertTextFormat = format;
    if (source.fromEdit && text !== undefined && range !== undefined) {
      target.textEdit = asCompletionTextEdit(text, range);
    } else {
      target.insertText = text;
    }
  }

  function asCompletionTextEdit(
    newText: string,
    range: Range | InsertReplaceRange,
  ): proto.TextEdit | proto.InsertReplaceEdit {
    if (InsertReplaceRange.is(range)) {
      return proto.InsertReplaceEdit.create(
        newText,
        asRange(range.inserting),
        asRange(range.replacing),
      );
    } else {
      return { newText, range: asRange(range) };
    }
  }

  function asTextEdit(edit: TextEdit): proto.TextEdit {
    return { range: asRange(edit.range), newText: edit.newText };
  }

  function asTextEdits(edits: TextEdit[]): proto.TextEdit[] {
    if (edits === undefined || edits === null) {
      return edits;
    }
    return edits.map(asTextEdit);
  }

  function asSymbolKind(item: SymbolKind): proto.SymbolKind {
    if (item <= SymbolKind.TypeParameter) {
      // Symbol kind is one based in the protocol and zero based in
      return (item + 1) as proto.SymbolKind;
    }
    return proto.SymbolKind.Property;
  }

  function asSymbolTag(item: SymbolTag): proto.SymbolTag {
    return item as proto.SymbolTag;
  }

  function asSymbolTags(items: ReadonlyArray<SymbolTag>): proto.SymbolTag[] {
    return items.map(asSymbolTag);
  }

  function asReferenceParams(
    textDocument: TextDocument,
    position: Position,
    options: { includeDeclaration: boolean },
  ): proto.ReferenceParams {
    return {
      textDocument: asTextDocumentIdentifier(textDocument),
      position: asWorkerPosition(position),
      context: { includeDeclaration: options.includeDeclaration },
    };
  }

  async function asCodeAction(
    item: Command | CodeAction,
    token?: CancellationToken,
  ): Promise<proto.CodeAction> {
    const result = proto.CodeAction.create(item.title);
    if (proto.Command.is(item)) {
      result.command = asCommand(item);
      return result;
    }
    if (item instanceof ProtocolCodeAction && item.data !== undefined) {
      result.data = item.data;
    }
    if (item.kind !== undefined) {
      result.kind = asCodeActionKind(item.kind);
    }
    if (item.diagnostics !== undefined) {
      result.diagnostics = await asDiagnostics(item.diagnostics, token);
    }
    if (item.edit !== undefined) {
      throw new Error(
        `VS Code code actions can only be converted to a protocol code action without an edit.`,
      );
    }
    if (item.command !== undefined) {
      result.command = asCommand(item.command);
    }
    if (item.isPreferred !== undefined) {
      result.isPreferred = item.isPreferred;
    }
    if (item.disabled !== undefined) {
      result.disabled = { reason: item.disabled.reason };
    }
    return result;
  }

  function asCodeActionSync(item: CodeAction): proto.CodeAction {
    const result = proto.CodeAction.create(item.title);
    if (item instanceof ProtocolCodeAction && item.data !== undefined) {
      result.data = item.data;
    }
    if (item.kind !== undefined) {
      result.kind = asCodeActionKind(item.kind);
    }
    if (item.diagnostics !== undefined) {
      result.diagnostics = asDiagnosticsSync(item.diagnostics);
    }
    if (item.edit !== undefined) {
      throw new Error(
        `VS Code code actions can only be converted to a protocol code action without an edit.`,
      );
    }
    if (item.command !== undefined) {
      result.command = asCommand(item.command);
    }
    if (item.isPreferred !== undefined) {
      result.isPreferred = item.isPreferred;
    }
    if (item.disabled !== undefined) {
      result.disabled = { reason: item.disabled.reason };
    }
    return result;
  }

  async function asCodeActionContext(
    context: CodeActionContext,
    token?: CancellationToken,
  ): Promise<proto.CodeActionContext> {
    if (context === undefined || context === null) {
      return context;
    }
    let only: proto.CodeActionKind[] | undefined;
    if (context.only && Is.string(context.only.value)) {
      only = [context.only.value];
    }
    return proto.CodeActionContext.create(
      await asDiagnostics(context.diagnostics, token),
      only,
      asCodeActionTriggerKind(context.triggerKind),
    );
  }

  function asCodeActionContextSync(
    context: CodeActionContext,
  ): proto.CodeActionContext {
    if (context === undefined || context === null) {
      return context;
    }
    let only: proto.CodeActionKind[] | undefined;
    if (context.only && Is.string(context.only.value)) {
      only = [context.only.value];
    }
    return proto.CodeActionContext.create(
      asDiagnosticsSync(context.diagnostics),
      only,
      asCodeActionTriggerKind(context.triggerKind),
    );
  }

  function asCodeActionTriggerKind(
    kind: CodeActionTriggerKind,
  ): proto.CodeActionTriggerKind | undefined {
    switch (kind) {
      case CodeActionTriggerKind.Invoke:
        return proto.CodeActionTriggerKind.Invoked;
      case CodeActionTriggerKind.Automatic:
        return proto.CodeActionTriggerKind.Automatic;
      default:
        return undefined;
    }
  }

  function asCodeActionKind(
    item: CodeActionKind | null | undefined,
  ): proto.CodeActionKind | undefined {
    if (item === undefined || item === null) {
      return undefined;
    }
    return item.value;
  }

  async function asCodeActionList(
    actions: (Command | CodeAction)[],
  ): Promise<proto.CodeAction[]> {
    return Promise.all(actions.map(async (action) => await asCodeAction(action)));
  }

  function asInlineValueContext(context: InlineValueContext): proto.InlineValueContext {
    return proto.InlineValueContext.create(
      context.frameId,
      asRange(context.stoppedLocation),
    );
  }

  function asInlineCompletionParams(
    document: TextDocument,
    position: Position,
    context: InlineCompletionContext,
  ): proto.InlineCompletionParams {
    return {
      textDocument: asTextDocumentIdentifier(document),
      position: asPosition(position),
      context: asInlineCompletionContext(context),
    };
  }

  function asInlineCompletionContext(
    context: InlineCompletionContext,
  ): proto.InlineCompletionContext {
    return {
      triggerKind: asInlineCompletionTriggerKind(context.triggerKind),
      selectedCompletionInfo: asSelectedCompletionInfo(context.selectedCompletionInfo),
    };
  }

  function asInlineCompletionTriggerKind(
    kind: InlineCompletionTriggerKind,
  ): proto.InlineCompletionTriggerKind {
    switch (kind) {
      case InlineCompletionTriggerKind.Invoke:
        return proto.InlineCompletionTriggerKind.Invoked;
      case InlineCompletionTriggerKind.Automatic:
        return proto.InlineCompletionTriggerKind.Automatic;
    }
  }

  function asSelectedCompletionInfo(
    info: SelectedCompletionInfo | null | undefined,
  ): proto.SelectedCompletionInfo | undefined {
    if (info === undefined || info === null) {
      return undefined;
    }
    return { range: asRange(info.range), text: info.text };
  }

  function asCommand(item: Command): proto.Command {
    const result = proto.Command.create(item.title, item.command);
    if (item.tooltip) {
      result.tooltip = item.tooltip;
    }
    if (item.arguments) {
      result.arguments = item.arguments;
    }
    return result;
  }

  function asCodeLens(item: CodeLens): proto.CodeLens {
    const result = proto.CodeLens.create(asRange(item.range));
    if (item.command) {
      result.command = asCommand(item.command);
    }
    if (item instanceof ProtocolCodeLens) {
      if (item.data) {
        result.data = item.data;
      }
    }
    return result;
  }

  function asFormattingOptions(
    options: FormattingOptions,
    fileOptions: FileFormattingOptions,
  ): proto.FormattingOptions {
    const result: proto.FormattingOptions = {
      tabSize: options.tabSize,
      insertSpaces: options.insertSpaces,
    };
    if (fileOptions.trimTrailingWhitespace) {
      result.trimTrailingWhitespace = true;
    }
    if (fileOptions.trimFinalNewlines) {
      result.trimFinalNewlines = true;
    }
    if (fileOptions.insertFinalNewline) {
      result.insertFinalNewline = true;
    }
    return result;
  }

  function asDocumentSymbolParams(
    textDocument: TextDocument,
  ): proto.DocumentSymbolParams {
    return {
      textDocument: asTextDocumentIdentifier(textDocument),
    };
  }

  function asCodeLensParams(textDocument: TextDocument): proto.CodeLensParams {
    return {
      textDocument: asTextDocumentIdentifier(textDocument),
    };
  }

  function asDocumentLink(item: DocumentLink): proto.DocumentLink {
    const result = proto.DocumentLink.create(asRange(item.range));
    if (item.target) {
      result.target = asUri(item.target);
    }
    if (item.tooltip !== undefined) {
      result.tooltip = item.tooltip;
    }
    const protocolItem =
      item instanceof ProtocolDocumentLink ? (item as ProtocolDocumentLink) : undefined;
    if (protocolItem && protocolItem.data) {
      result.data = protocolItem.data;
    }
    return result;
  }

  function asDocumentLinkParams(textDocument: TextDocument): proto.DocumentLinkParams {
    return {
      textDocument: asTextDocumentIdentifier(textDocument),
    };
  }

  function asCallHierarchyItem(value: CallHierarchyItem): proto.CallHierarchyItem {
    const result: proto.CallHierarchyItem = {
      name: value.name,
      kind: asSymbolKind(value.kind),
      uri: asUri(value.uri),
      range: asRange(value.range),
      selectionRange: asRange(value.selectionRange),
    };
    if (value.detail !== undefined && value.detail.length > 0) {
      result.detail = value.detail;
    }
    if (value.tags !== undefined) {
      result.tags = asSymbolTags(value.tags);
    }
    if (value instanceof ProtocolCallHierarchyItem && value.data !== undefined) {
      result.data = value.data;
    }
    return result;
  }

  function asTypeHierarchyItem(value: TypeHierarchyItem): proto.TypeHierarchyItem {
    const result: proto.TypeHierarchyItem = {
      name: value.name,
      kind: asSymbolKind(value.kind),
      uri: asUri(value.uri),
      range: asRange(value.range),
      selectionRange: asRange(value.selectionRange),
    };
    if (value.detail !== undefined && value.detail.length > 0) {
      result.detail = value.detail;
    }
    if (value.tags !== undefined) {
      result.tags = asSymbolTags(value.tags);
    }
    if (value instanceof ProtocolTypeHierarchyItem && value.data !== undefined) {
      result.data = value.data;
    }
    return result;
  }

  function asWorkspaceSymbol(item: SymbolInformation): proto.WorkspaceSymbol {
    const result: proto.WorkspaceSymbol =
      item instanceof WorkspaceSymbol
        ? {
            name: item.name,
            kind: asSymbolKind(item.kind),
            location: item.hasRange
              ? asLocation(item.location)
              : { uri: _uriConverter(item.location.uri) },
            data: item.data,
          }
        : {
            name: item.name,
            kind: asSymbolKind(item.kind),
            location: asLocation(item.location),
          };
    if (item.tags !== undefined) {
      result.tags = asSymbolTags(item.tags);
    }
    if (item.containerName !== '') {
      result.containerName = item.containerName;
    }
    return result;
  }

  function asInlayHint(item: InlayHint): proto.InlayHint {
    const label =
      typeof item.label === 'string'
        ? item.label
        : item.label.map(asInlayHintLabelPart);
    const result = proto.InlayHint.create(asPosition(item.position), label);
    if (item.kind !== undefined) {
      result.kind = item.kind;
    }
    if (item.textEdits !== undefined) {
      result.textEdits = asTextEdits(item.textEdits);
    }
    if (item.tooltip !== undefined) {
      result.tooltip = asTooltip(item.tooltip);
    }
    if (item.paddingLeft !== undefined) {
      result.paddingLeft = item.paddingLeft;
    }
    if (item.paddingRight !== undefined) {
      result.paddingRight = item.paddingRight;
    }
    if (item instanceof ProtocolInlayHint && item.data !== undefined) {
      result.data = item.data;
    }
    return result;
  }

  function asInlayHintLabelPart(item: InlayHintLabelPart): proto.InlayHintLabelPart {
    const result = proto.InlayHintLabelPart.create(item.value);
    if (item.location !== undefined) {
      result.location = asLocation(item.location);
    }
    if (item.command !== undefined) {
      result.command = asCommand(item.command);
    }
    if (item.tooltip !== undefined) {
      result.tooltip = asTooltip(item.tooltip);
    }
    return result;
  }

  function asTooltip(value: string | MarkdownString): string | proto.MarkupContent {
    if (typeof value === 'string') {
      return value;
    }
    const result: proto.MarkupContent = {
      kind: proto.MarkupKind.Markdown,
      value: value.value,
    };
    return result;
  }

  function asSignatureHelpResult(item: undefined | null): undefined;
  function asSignatureHelpResult(item: SignatureHelp): proto.SignatureHelp;
  function asSignatureHelpResult(
    item: SignatureHelp | undefined | null,
  ): proto.SignatureHelp | undefined;
  function asSignatureHelpResult(
    item: SignatureHelp | undefined | null,
  ): proto.SignatureHelp | undefined {
    if (!item) {
      return undefined;
    }
    const result = <proto.SignatureHelp>{};
    if (isNumber(item.activeSignature)) {
      result.activeSignature = item.activeSignature;
    } else {
      // activeSignature was optional in the past
      result.activeSignature = 0;
    }
    if (isNumber(item.activeParameter)) {
      result.activeParameter = item.activeParameter;
    } else {
      // activeParameter was optional in the past
      result.activeParameter = 0;
    }
    if (item.signatures) {
      result.signatures = asSignatureInformations(item.signatures);
    } else {
      result.signatures = [];
    }
    return result;
  }

  return {
    asUri,
    asTextDocumentIdentifier,
    asTextDocumentItem,
    asVersionedTextDocumentIdentifier,
    asOpenTextDocumentParams,
    asChangeTextDocumentParams,
    asCloseTextDocumentParams,
    asSaveTextDocumentParams,
    asWillSaveTextDocumentParams,
    asDidCreateFilesParams,
    asDidRenameFilesParams,
    asDidDeleteFilesParams,
    asWillCreateFilesParams,
    asWillRenameFilesParams,
    asWillDeleteFilesParams,
    asTextDocumentPositionParams,
    asCompletionParams,
    asSignatureHelpParams,
    asWorkerPosition,
    asRange,
    asRanges,
    asPosition,
    asPositions,
    asPositionsSync,
    asLocation,
    asDiagnosticSeverity,
    asDiagnosticTag,
    asDiagnostic,
    asDiagnostics,
    asDiagnosticsSync,
    asCompletionItem,
    asTextEdit,
    asSymbolKind,
    asSymbolTag,
    asSymbolTags,
    asReferenceParams,
    asCodeAction,
    asCodeActionSync,
    asCodeActionContext,
    asCodeActionContextSync,
    asInlineValueContext,
    asCommand,
    asCodeLens,
    asFormattingOptions,
    asDocumentSymbolParams,
    asCodeLensParams,
    asDocumentLink,
    asDocumentLinkParams,
    asCallHierarchyItem,
    asTypeHierarchyItem,
    asInlayHint,
    asWorkspaceSymbol,
    asInlineCompletionParams,
    asInlineCompletionContext,
    asDefinitionResult,
    asLocationLink,
    asSignatureHelpResult,
    asCodeActionList,
  };
}
