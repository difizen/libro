/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as ls from '@difizen/vscode-languageserver-protocol';
import {
  NotebookCellTextDocumentFilter,
  TextDocumentFilter,
} from '@difizen/vscode-languageserver-protocol';
import type {
  CallHierarchyItem,
  CancellationToken,
  CodeAction,
  CodeActionProviderMetadata,
  CodeLens,
  Command,
  CompletionItem,
  CompletionItemLabel,
  Declaration,
  Definition,
  DefinitionLink,
  Diagnostic,
  DocumentFilter,
  DocumentLink,
  DocumentSelector,
  GlobPattern,
  InlayHint,
  InlineValue,
  LocationLink,
  SemanticTokensLegend,
  TypeHierarchyItem,
  WorkspaceEditEntryMetadata,
  TextDocument,
  MarkdownString as VMarkdownString,
  SemanticTokens as VSemanticTokens,
} from 'vscode';
import { URI } from 'vscode-uri';

import ProtocolCallHierarchyItem from './protocolCallHierarchyItem.js';
import ProtocolCodeAction from './protocolCodeAction.js';
import ProtocolCodeLens from './protocolCodeLens.js';
import ProtocolCompletionItem from './protocolCompletionItem.js';
import { ProtocolDiagnostic, DiagnosticCode } from './protocolDiagnostic.js';
import ProtocolDocumentLink from './protocolDocumentLink.js';
import ProtocolInlayHint from './protocolInlayHint.js';
import ProtocolTypeHierarchyItem from './protocolTypeHierarchyItem.js';
import WorkspaceSymbol from './protocolWorkspaceSymbol.js';
import * as async from './utils/async.js';
import * as Is from './utils/is.js';
import {
  Position,
  Uri,
  CompletionList,
  DiagnosticSeverity,
  DiagnosticTag,
  Hover,
  DocumentHighlight,
  DocumentHighlightKind,
  DocumentSymbol,
  ParameterInformation,
  SignatureHelp,
  SignatureInformation,
  SymbolInformation,
  SymbolKind,
  SymbolTag,
  TextEdit,
  CodeActionKind,
  WorkspaceEdit,
  CallHierarchyIncomingCall,
  Color,
  ColorInformation,
  ColorPresentation,
  FoldingRange,
  FoldingRangeKind,
  SelectionRange,
  SemanticTokensEdit,
  SemanticTokensEdits,
  CallHierarchyOutgoingCall,
  InlineSuggestion as InlineCompletionItem,
  InlineSuggestionList as InlineCompletionList,
  MarkdownString,
  SemanticTokens,
  LinkedEditingRanges,
} from './vscodeAdaptor/vscodeAdaptor.js';
import {
  DiagnosticRelatedInformation,
  Range,
  Location,
  InlineValueText,
  InlineValueVariableLookup,
  InlineValueEvaluatableExpression,
  RelativePattern,
  InlayHintLabelPart,
} from './vscodeAdaptor/vscodeAdaptor.js';
import {
  CompletionItemKind,
  CompletionItemTag,
  workspace,
} from './vscodeAdaptor/vscodeAdaptor.js';
import { SnippetString } from './vscodeAdaptor/vscodeAdaptor.js';

interface InsertReplaceRange {
  inserting: Range;
  replacing: Range;
}

export interface Converter {
  asUri(value: string): Uri;

  asDocumentSelector(value: ls.DocumentSelector): DocumentSelector;

  asPosition(value: undefined | null): undefined;
  asPosition(value: ls.Position): Position;
  asPosition(value: ls.Position | undefined | null): Position | undefined;

  asRange(value: undefined | null): undefined;
  asRange(value: ls.Range): Range;
  asRange(value: ls.Range | undefined | null): Range | undefined;

  asRanges(items: ReadonlyArray<ls.Range>, token?: CancellationToken): Promise<Range[]>;

  asDiagnostic(diagnostic: ls.Diagnostic): Diagnostic;

  asDiagnostics(
    diagnostics: ls.Diagnostic[],
    token?: CancellationToken,
  ): Promise<Diagnostic[]>;

  asDiagnosticSeverity(value: number | undefined | null): DiagnosticSeverity;
  asDiagnosticTag(tag: ls.DiagnosticTag): DiagnosticTag | undefined;

  asHover(hover: undefined | null): undefined;
  asHover(hover: ls.Hover): Hover;
  asHover(hover: ls.Hover | undefined | null): Hover | undefined;

  asCompletionResult(
    value: undefined | null,
    allCommitCharacters?: string[],
    token?: CancellationToken,
  ): Promise<undefined>;
  asCompletionResult(
    value: ls.CompletionList,
    allCommitCharacters?: string[],
    token?: CancellationToken,
  ): Promise<CompletionList>;
  asCompletionResult(
    value: ls.CompletionItem[],
    allCommitCharacters?: string[],
    token?: CancellationToken,
  ): Promise<CompletionItem[]>;
  asCompletionResult(
    value: ls.CompletionItem[] | ls.CompletionList | undefined | null,
    allCommitCharacters?: string[],
    token?: CancellationToken,
  ): Promise<CompletionItem[] | CompletionList | undefined>;

  asCompletionItem(
    item: ls.CompletionItem,
    defaultCommitCharacters?: string[],
  ): ProtocolCompletionItem;

  asTextEdit(edit: undefined | null): undefined;
  asTextEdit(edit: ls.TextEdit): TextEdit;
  asTextEdit(edit: ls.TextEdit | undefined | null): TextEdit | undefined;

  asTextEdits(items: undefined | null, token?: CancellationToken): Promise<undefined>;
  asTextEdits(items: ls.TextEdit[], token?: CancellationToken): Promise<TextEdit[]>;
  asTextEdits(
    items: ls.TextEdit[] | undefined | null,
    token?: CancellationToken,
  ): Promise<TextEdit[] | undefined>;

  asSignatureHelp(
    item: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  asSignatureHelp(
    item: ls.SignatureHelp,
    token?: CancellationToken,
  ): Promise<SignatureHelp>;
  asSignatureHelp(
    item: ls.SignatureHelp | undefined | null,
    token?: CancellationToken,
  ): Promise<SignatureHelp | undefined>;

  asSignatureInformation(
    item: ls.SignatureInformation,
    token?: CancellationToken,
  ): Promise<SignatureInformation>;

  asSignatureInformations(
    items: ls.SignatureInformation[],
    token?: CancellationToken,
  ): Promise<SignatureInformation[]>;

  asParameterInformation(item: ls.ParameterInformation): ParameterInformation;

  asParameterInformations(
    item: ls.ParameterInformation[],
    token?: CancellationToken,
  ): Promise<ParameterInformation[]>;

  asLocation(item: ls.Location): Location;
  asLocation(item: undefined | null): undefined;
  asLocation(item: ls.Location | undefined | null): Location | undefined;

  asDeclarationResult(
    item: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  asDeclarationResult(
    item: ls.Declaration,
    token?: CancellationToken,
  ): Promise<Location | Location[]>;
  asDeclarationResult(
    item: ls.DeclarationLink[],
    token?: CancellationToken,
  ): Promise<LocationLink[]>;
  asDeclarationResult(
    item: ls.Declaration | ls.DeclarationLink[] | undefined | null,
    token?: CancellationToken,
  ): Promise<Declaration | undefined>;

  asDefinitionResult(
    item: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  asDefinitionResult(
    item: ls.Definition,
    token?: CancellationToken,
  ): Promise<Definition>;
  asDefinitionResult(
    item: ls.DefinitionLink[],
    token?: CancellationToken,
  ): Promise<DefinitionLink[]>;
  asDefinitionResult(
    item: ls.Definition | ls.DefinitionLink[] | undefined | null,
    token?: CancellationToken,
  ): Promise<Definition | DefinitionLink[] | undefined>;

  asReferences(values: undefined | null, token?: CancellationToken): Promise<undefined>;
  asReferences(values: ls.Location[], token?: CancellationToken): Promise<Location[]>;
  asReferences(
    values: ls.Location[] | undefined | null,
    token?: CancellationToken,
  ): Promise<Location[] | undefined>;

  asDocumentHighlightKind(item: number): DocumentHighlightKind;

  asDocumentHighlight(item: ls.DocumentHighlight): DocumentHighlight;

  asDocumentHighlights(
    values: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  asDocumentHighlights(
    values: ls.DocumentHighlight[],
    token?: CancellationToken,
  ): Promise<DocumentHighlight[]>;
  asDocumentHighlights(
    values: ls.DocumentHighlight[] | undefined | null,
    token?: CancellationToken,
  ): Promise<DocumentHighlight[] | undefined>;

  asSymbolKind(item: ls.SymbolKind): SymbolKind;

  asSymbolTag(item: ls.SymbolTag): SymbolTag | undefined;
  asSymbolTags(items: undefined | null): undefined;
  asSymbolTags(items: ReadonlyArray<ls.SymbolTag>): SymbolTag[];
  asSymbolTags(
    items: ReadonlyArray<ls.SymbolTag> | undefined | null,
  ): SymbolTag[] | undefined;

  asSymbolInformation(
    item: ls.SymbolInformation | ls.WorkspaceSymbol,
  ): SymbolInformation;

  asSymbolInformations(
    values: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  asSymbolInformations(
    values: ls.SymbolInformation[] | ls.WorkspaceSymbol[],
    token?: CancellationToken,
  ): Promise<SymbolInformation[]>;
  asSymbolInformations(
    values: ls.SymbolInformation[] | ls.WorkspaceSymbol[] | undefined | null,
    token?: CancellationToken,
  ): Promise<SymbolInformation[] | undefined>;

  asDocumentSymbol(value: ls.DocumentSymbol, token?: CancellationToken): DocumentSymbol;

  asDocumentSymbols(
    value: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  asDocumentSymbols(
    value: ls.DocumentSymbol[],
    token?: CancellationToken,
  ): Promise<DocumentSymbol[]>;
  asDocumentSymbols(
    value: ls.DocumentSymbol[] | undefined | null,
    token?: CancellationToken,
  ): Promise<DocumentSymbol[] | undefined>;

  asCommand(item: ls.Command): Command;

  asCommands(items: undefined | null, token?: CancellationToken): Promise<undefined>;
  asCommands(items: ls.Command[], token?: CancellationToken): Promise<Command[]>;
  asCommands(
    items: ls.Command[] | undefined | null,
    token?: CancellationToken,
  ): Promise<Command[] | undefined>;

  asCodeAction(item: undefined | null, token?: CancellationToken): Promise<undefined>;
  asCodeAction(item: ls.CodeAction, token?: CancellationToken): Promise<CodeAction>;
  asCodeAction(
    item: ls.CodeAction | undefined | null,
    token?: CancellationToken,
  ): Promise<CodeAction | undefined>;

  asCodeActionKind(item: null | undefined): undefined;
  asCodeActionKind(item: ls.CodeActionKind): CodeActionKind;
  asCodeActionKind(
    item: ls.CodeActionKind | null | undefined,
  ): CodeActionKind | undefined;

  asCodeActionKinds(item: null | undefined): undefined;
  asCodeActionKinds(items: ls.CodeActionKind[]): CodeActionKind[];
  asCodeActionKinds(
    item: ls.CodeActionKind[] | null | undefined,
  ): CodeActionKind[] | undefined;

  asCodeActionDocumentations(items: null | undefined): undefined;
  asCodeActionDocumentations(
    items: ls.CodeActionKindDocumentation[],
  ): CodeActionProviderMetadata['documentation'];
  asCodeActionDocumentations(
    items: ls.CodeActionKindDocumentation[] | null | undefined,
  ): CodeActionProviderMetadata['documentation'] | undefined;

  asCodeActionResult(
    items: (ls.Command | ls.CodeAction)[],
    token?: CancellationToken,
  ): Promise<(Command | CodeAction)[]>;

  asCodeLens(item: ls.CodeLens): CodeLens;
  asCodeLens(item: undefined | null): undefined;
  asCodeLens(item: ls.CodeLens | undefined | null): CodeLens | undefined;

  asCodeLenses(items: undefined | null, token?: CancellationToken): Promise<undefined>;
  asCodeLenses(items: ls.CodeLens[], token?: CancellationToken): Promise<CodeLens[]>;
  asCodeLenses(
    items: ls.CodeLens[] | undefined | null,
    token?: CancellationToken,
  ): Promise<CodeLens[] | undefined>;

  asWorkspaceEdit(
    item: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  asWorkspaceEdit(
    item: ls.WorkspaceEdit,
    token?: CancellationToken,
  ): Promise<WorkspaceEdit>;
  asWorkspaceEdit(
    item: ls.WorkspaceEdit | undefined | null,
    token?: CancellationToken,
  ): Promise<WorkspaceEdit | undefined>;

  asDocumentLink(item: ls.DocumentLink): DocumentLink;

  asDocumentLinks(
    items: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  asDocumentLinks(
    items: ls.DocumentLink[],
    token?: CancellationToken,
  ): Promise<DocumentLink[]>;
  asDocumentLinks(
    items: ls.DocumentLink[] | undefined | null,
    token?: CancellationToken,
  ): Promise<DocumentLink[] | undefined>;

  asColor(color: ls.Color): Color;

  asColorInformation(ci: ls.ColorInformation): ColorInformation;

  asColorInformations(
    colorPresentations: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  asColorInformations(
    colorPresentations: ls.ColorInformation[],
    token?: CancellationToken,
  ): Promise<ColorInformation[]>;
  asColorInformations(
    colorInformation: ls.ColorInformation[] | undefined | null,
    token?: CancellationToken,
  ): Promise<ColorInformation[]>;

  asColorPresentation(cp: ls.ColorPresentation): ColorPresentation;

  asColorPresentations(
    colorPresentations: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  asColorPresentations(
    colorPresentations: ls.ColorPresentation[],
    token?: CancellationToken,
  ): Promise<ColorPresentation[]>;
  asColorPresentations(
    colorPresentations: ls.ColorPresentation[] | undefined | null,
    token?: CancellationToken,
  ): Promise<ColorPresentation[] | undefined>;

  asFoldingRangeKind(kind: string | undefined): FoldingRangeKind | undefined;

  asFoldingRange(r: ls.FoldingRange): FoldingRange;

  asFoldingRanges(
    foldingRanges: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  asFoldingRanges(
    foldingRanges: ls.FoldingRange[],
    token?: CancellationToken,
  ): Promise<FoldingRange[]>;
  asFoldingRanges(
    foldingRanges: ls.FoldingRange[] | undefined | null,
    token?: CancellationToken,
  ): Promise<FoldingRange[] | undefined>;

  asSelectionRange(selectionRange: ls.SelectionRange): SelectionRange;

  asSelectionRanges(
    selectionRanges: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  asSelectionRanges(
    selectionRanges: ls.SelectionRange[],
    token?: CancellationToken,
  ): Promise<SelectionRange[]>;
  asSelectionRanges(
    selectionRanges: ls.SelectionRange[] | undefined | null,
    token?: CancellationToken,
  ): Promise<SelectionRange[] | undefined>;

  asInlineValue(value: ls.InlineValue): InlineValue;

  asInlineValues(
    values: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  asInlineValues(
    values: ls.InlineValue[],
    token?: CancellationToken,
  ): Promise<InlineValue[]>;
  asInlineValues(
    values: ls.InlineValue[] | undefined | null,
    token?: CancellationToken,
  ): Promise<InlineValue[] | undefined>;

  asInlayHint(value: ls.InlayHint, token?: CancellationToken): Promise<InlayHint>;

  asInlayHints(values: undefined | null, token?: CancellationToken): Promise<undefined>;
  asInlayHints(values: ls.InlayHint[], token?: CancellationToken): Promise<InlayHint[]>;
  asInlayHints(
    values: ls.InlayHint[] | undefined | null,
    token?: CancellationToken,
  ): Promise<InlayHint[] | undefined>;

  asSemanticTokensLegend(value: ls.SemanticTokensLegend): SemanticTokensLegend;

  asSemanticTokens(
    value: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  asSemanticTokens(
    value: ls.SemanticTokens,
    token?: CancellationToken,
  ): Promise<VSemanticTokens>;
  asSemanticTokens(
    value: ls.SemanticTokens | undefined | null,
    token?: CancellationToken,
  ): Promise<VSemanticTokens | undefined>;

  asSemanticTokensEdit(value: ls.SemanticTokensEdit): SemanticTokensEdit;

  asSemanticTokensEdits(
    value: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  asSemanticTokensEdits(
    value: ls.SemanticTokensDelta,
    token?: CancellationToken,
  ): Promise<SemanticTokensEdits>;
  asSemanticTokensEdits(
    value: ls.SemanticTokensDelta | undefined | null,
    token?: CancellationToken,
  ): Promise<SemanticTokensEdits | undefined>;

  asCallHierarchyItem(item: null): undefined;
  asCallHierarchyItem(item: ls.CallHierarchyItem): CallHierarchyItem;
  asCallHierarchyItem(item: ls.CallHierarchyItem | null): CallHierarchyItem | undefined;

  asCallHierarchyItems(items: null, token?: CancellationToken): Promise<undefined>;
  asCallHierarchyItems(
    items: ls.CallHierarchyItem[],
    token?: CancellationToken,
  ): Promise<CallHierarchyItem[]>;
  asCallHierarchyItems(
    items: ls.CallHierarchyItem[] | null,
    token?: CancellationToken,
  ): Promise<CallHierarchyItem[] | undefined>;

  asCallHierarchyIncomingCall(
    item: ls.CallHierarchyIncomingCall,
    token?: CancellationToken,
  ): Promise<CallHierarchyIncomingCall>;

  asCallHierarchyIncomingCalls(
    items: null,
    token?: CancellationToken,
  ): Promise<undefined>;
  asCallHierarchyIncomingCalls(
    items: ReadonlyArray<ls.CallHierarchyIncomingCall>,
    token?: CancellationToken,
  ): Promise<CallHierarchyIncomingCall[]>;
  asCallHierarchyIncomingCalls(
    items: ReadonlyArray<ls.CallHierarchyIncomingCall> | null,
    token?: CancellationToken,
  ): Promise<CallHierarchyIncomingCall[] | undefined>;

  asCallHierarchyOutgoingCall(
    item: ls.CallHierarchyOutgoingCall,
    token?: CancellationToken,
  ): Promise<CallHierarchyOutgoingCall>;

  asCallHierarchyOutgoingCalls(
    items: null,
    token?: CancellationToken,
  ): Promise<undefined>;
  asCallHierarchyOutgoingCalls(
    items: ReadonlyArray<ls.CallHierarchyOutgoingCall>,
    token?: CancellationToken,
  ): Promise<CallHierarchyOutgoingCall[]>;
  asCallHierarchyOutgoingCalls(
    items: ReadonlyArray<ls.CallHierarchyOutgoingCall> | null,
    token?: CancellationToken,
  ): Promise<CallHierarchyOutgoingCall[] | undefined>;

  asLinkedEditingRanges(
    value: null | undefined,
    token?: CancellationToken,
  ): Promise<undefined>;
  asLinkedEditingRanges(
    value: ls.LinkedEditingRanges,
    token?: CancellationToken,
  ): Promise<LinkedEditingRanges>;
  asLinkedEditingRanges(
    value: ls.LinkedEditingRanges | null | undefined,
    token?: CancellationToken,
  ): Promise<LinkedEditingRanges | undefined>;

  asTypeHierarchyItem(item: null): undefined;
  asTypeHierarchyItem(item: ls.TypeHierarchyItem): TypeHierarchyItem;
  asTypeHierarchyItem(item: ls.TypeHierarchyItem | null): TypeHierarchyItem | undefined;

  asTypeHierarchyItems(items: null, token?: CancellationToken): Promise<undefined>;
  asTypeHierarchyItems(
    items: ls.TypeHierarchyItem[],
    token?: CancellationToken,
  ): Promise<TypeHierarchyItem[]>;
  asTypeHierarchyItems(
    items: ls.TypeHierarchyItem[] | null,
    token?: CancellationToken,
  ): Promise<TypeHierarchyItem[] | undefined>;

  asGlobPattern(pattern: ls.GlobPattern): GlobPattern | undefined;

  asInlineCompletionResult(
    value: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  asInlineCompletionResult(
    value: ls.InlineCompletionList,
    token?: CancellationToken,
  ): Promise<InlineCompletionList>;
  asInlineCompletionResult(
    value: ls.InlineCompletionItem[],
    token?: CancellationToken,
  ): Promise<InlineCompletionItem[]>;
  asInlineCompletionResult(
    value: ls.InlineCompletionItem[] | ls.InlineCompletionList | undefined | null,
    token?: CancellationToken,
  ): Promise<InlineCompletionItem[] | InlineCompletionList | undefined>;

  asInlineCompletionItem(item: ls.InlineCompletionItem): InlineCompletionItem;

  // new

  asTextDcouemnt(value: ls.TextDocumentIdentifier): TextDocument;
}

export interface URIConverter {
  (value: string): Uri;
}

interface CodeFenceBlock {
  language: string;
  value: string;
}

namespace CodeBlock {
  export function is(value: any): value is CodeFenceBlock {
    const candidate: CodeFenceBlock = value;
    return candidate && Is.string(candidate.language) && Is.string(candidate.value);
  }
}

export function createConverter(
  uriConverter: URIConverter | undefined,
  trustMarkdown: boolean | { readonly enabledCommands: readonly string[] },
  supportHtml: boolean,
): Converter {
  const nullConverter = (value: string) => Uri.parse(value);

  const _uriConverter: URIConverter = uriConverter || nullConverter;

  function asUri(value: string): Uri {
    return _uriConverter(value);
  }

  function asDocumentSelector(selector: ls.DocumentSelector): DocumentSelector {
    const result: DocumentFilter | string | Array<DocumentFilter | string> = [];
    for (const filter of selector) {
      if (typeof filter === 'string') {
        result.push(filter);
      } else if (NotebookCellTextDocumentFilter.is(filter)) {
        // We first need to check for the notebook cell filter since a TextDocumentFilter would
        // match both (e.g. the notebook is optional).
        if (typeof filter.notebook === 'string') {
          result.push({ notebookType: filter.notebook, language: filter.language });
        } else {
          const notebookType = filter.notebook.notebookType ?? '*';
          result.push({
            notebookType: notebookType,
            scheme: filter.notebook.scheme,
            pattern: filter.notebook.pattern,
            language: filter.language,
          });
        }
      } else if (TextDocumentFilter.is(filter)) {
        result.push({
          language: filter.language,
          scheme: filter.scheme,
          pattern: filter.pattern,
        });
      }
    }
    return result;
  }

  async function asDiagnostics(
    diagnostics: ReadonlyArray<ls.Diagnostic>,
    token?: CancellationToken,
  ): Promise<Diagnostic[]> {
    return async.map(diagnostics, asDiagnostic, token);
  }

  function asDiagnosticsSync(diagnostics: ls.Diagnostic[]): Diagnostic[] {
    const result: Diagnostic[] = new Array(diagnostics.length);
    for (let i = 0; i < diagnostics.length; i++) {
      result[i] = asDiagnostic(diagnostics[i]);
    }
    return result;
  }

  function asDiagnostic(diagnostic: ls.Diagnostic): Diagnostic {
    const result = new ProtocolDiagnostic(
      asRange(diagnostic.range),
      diagnostic.message,
      asDiagnosticSeverity(diagnostic.severity),
      diagnostic.data,
    );
    if (diagnostic.code !== undefined) {
      if (typeof diagnostic.code === 'string' || typeof diagnostic.code === 'number') {
        if (ls.CodeDescription.is(diagnostic.codeDescription)) {
          result.code = {
            value: diagnostic.code,
            target: asUri(diagnostic.codeDescription.href),
          };
        } else {
          result.code = diagnostic.code;
        }
      } else if (DiagnosticCode.is(diagnostic.code)) {
        // This is for backwards compatibility of a proposed API.
        // We should remove this at some point.
        result.hasDiagnosticCode = true;
        const diagnosticCode = diagnostic.code as DiagnosticCode;
        result.code = {
          value: diagnosticCode.value,
          target: asUri(diagnosticCode.target),
        };
      }
    }
    if (diagnostic.source) {
      result.source = diagnostic.source;
    }
    if (diagnostic.relatedInformation) {
      result.relatedInformation = asRelatedInformation(diagnostic.relatedInformation);
    }
    if (Array.isArray(diagnostic.tags)) {
      result.tags = asDiagnosticTags(diagnostic.tags);
    }
    return result;
  }

  function asRelatedInformation(
    relatedInformation: ls.DiagnosticRelatedInformation[],
  ): DiagnosticRelatedInformation[] {
    const result: DiagnosticRelatedInformation[] = new Array(relatedInformation.length);
    for (let i = 0; i < relatedInformation.length; i++) {
      const info = relatedInformation[i];
      result[i] = new DiagnosticRelatedInformation(
        asLocation(info.location),
        info.message,
      );
    }
    return result;
  }

  function asDiagnosticTags(tags: undefined | null): undefined;
  function asDiagnosticTags(tags: ls.DiagnosticTag[]): DiagnosticTag[];
  function asDiagnosticTags(
    tags: ls.DiagnosticTag[] | undefined | null,
  ): DiagnosticTag[] | undefined;
  function asDiagnosticTags(
    tags: ls.DiagnosticTag[] | undefined | null,
  ): DiagnosticTag[] | undefined {
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

  function asDiagnosticTag(tag: ls.DiagnosticTag): DiagnosticTag | undefined {
    switch (tag) {
      case ls.DiagnosticTag.Unnecessary:
        return DiagnosticTag.Unnecessary;
      case ls.DiagnosticTag.Deprecated:
        return DiagnosticTag.Deprecated;
      default:
        return undefined;
    }
  }

  function asPosition(value: undefined | null): undefined;
  function asPosition(value: ls.Position): Position;
  function asPosition(value: ls.Position | undefined | null): Position | undefined;
  function asPosition(value: ls.Position | undefined | null): Position | undefined {
    return value ? new Position(value.line, value.character) : undefined;
  }

  function asRange(value: undefined | null): undefined;
  function asRange(value: ls.Range): Range;
  function asRange(value: ls.Range | undefined | null): Range | undefined;
  function asRange(value: ls.Range | undefined | null): Range | undefined {
    return value
      ? new Range(
          value.start.line,
          value.start.character,
          value.end.line,
          value.end.character,
        )
      : undefined;
  }

  async function asRanges(
    items: ReadonlyArray<ls.Range>,
    token?: CancellationToken,
  ): Promise<Range[]> {
    return async.map(
      items,
      (range: ls.Range) => {
        return new Range(
          range.start.line,
          range.start.character,
          range.end.line,
          range.end.character,
        );
      },
      token,
    );
  }

  function asDiagnosticSeverity(value: number | undefined | null): DiagnosticSeverity {
    if (value === undefined || value === null) {
      return DiagnosticSeverity.Error;
    }
    switch (value) {
      case ls.DiagnosticSeverity.Error:
        return DiagnosticSeverity.Error;
      case ls.DiagnosticSeverity.Warning:
        return DiagnosticSeverity.Warning;
      case ls.DiagnosticSeverity.Information:
        return DiagnosticSeverity.Information;
      case ls.DiagnosticSeverity.Hint:
        return DiagnosticSeverity.Hint;
    }
    return DiagnosticSeverity.Error;
  }

  function asHoverContent(
    value: ls.MarkedString | ls.MarkedString[] | ls.MarkupContent,
  ): VMarkdownString | VMarkdownString[] {
    if (Is.string(value)) {
      return asMarkdownString(value);
    } else if (CodeBlock.is(value)) {
      const result = asMarkdownString();
      return result.appendCodeblock(value.value, value.language);
    } else if (Array.isArray(value)) {
      const result: VMarkdownString[] = [];
      for (const element of value) {
        const item = asMarkdownString();
        if (CodeBlock.is(element)) {
          item.appendCodeblock(element.value, element.language);
        } else {
          item.appendMarkdown(element);
        }
        result.push(item);
      }
      return result;
    } else {
      return asMarkdownString(value);
    }
  }

  function asDocumentation(value: string | ls.MarkupContent): string | VMarkdownString {
    if (Is.string(value)) {
      return value;
    } else {
      switch (value.kind) {
        case ls.MarkupKind.Markdown:
          return asMarkdownString(value.value);
        case ls.MarkupKind.PlainText:
          return value.value;
        default:
          return `Unsupported Markup content received. Kind is: ${value.kind}`;
      }
    }
  }

  function asMarkdownString(value?: string | ls.MarkupContent): VMarkdownString {
    let result: MarkdownString;
    if (value === undefined || typeof value === 'string') {
      result = new MarkdownString(value);
    } else {
      switch (value.kind) {
        case ls.MarkupKind.Markdown:
          result = new MarkdownString(value.value);
          break;
        case ls.MarkupKind.PlainText:
          result = new MarkdownString();
          result.appendText(value.value);
          break;
        default:
          result = new MarkdownString();
          result.appendText(
            `Unsupported Markup content received. Kind is: ${value.kind}`,
          );
          break;
      }
    }
    result.isTrusted = trustMarkdown;
    result.supportHtml = supportHtml;
    return result;
  }

  function asHover(hover: ls.Hover): Hover;
  function asHover(hover: undefined | null): undefined;
  function asHover(hover: ls.Hover | undefined | null): Hover | undefined;
  function asHover(hover: ls.Hover | undefined | null): Hover | undefined {
    if (!hover) {
      return undefined;
    }
    return new Hover(asHoverContent(hover.contents), asRange(hover.range));
  }

  function asCompletionResult(
    value: ls.CompletionList,
    allCommitCharacters: string[] | undefined,
    token?: CancellationToken,
  ): Promise<CompletionList>;
  function asCompletionResult(
    value: ls.CompletionItem[],
    allCommitCharacters: string[] | undefined,
    token?: CancellationToken,
  ): Promise<CompletionItem[]>;
  function asCompletionResult(
    value: undefined | null,
    allCommitCharacters: string[] | undefined,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asCompletionResult(
    value: ls.CompletionItem[] | ls.CompletionList | undefined | null,
    allCommitCharacters: string[] | undefined,
    token?: CancellationToken,
  ): Promise<CompletionItem[] | CompletionList | undefined>;
  async function asCompletionResult(
    value: ls.CompletionItem[] | ls.CompletionList | undefined | null,
    allCommitCharacters: string[] | undefined,
    token?: CancellationToken,
  ): Promise<CompletionItem[] | CompletionList | undefined> {
    if (!value) {
      return undefined;
    }
    if (Array.isArray(value)) {
      return async.map(
        value,
        (item) => asCompletionItem(item, allCommitCharacters),
        token,
      );
    }
    const list = <ls.CompletionList>value;
    const { defaultRange, commitCharacters } = getCompletionItemDefaults(
      list,
      allCommitCharacters,
    );
    const converted = await async.map(
      list.items,
      (item) => {
        return asCompletionItem(
          item,
          commitCharacters,
          defaultRange,
          list.itemDefaults?.insertTextMode,
          list.itemDefaults?.insertTextFormat,
          list.itemDefaults?.data,
        );
      },
      token,
    );
    return new CompletionList(converted, list.isIncomplete);
  }

  function getCompletionItemDefaults(
    list: ls.CompletionList,
    allCommitCharacters?: string[],
  ): {
    defaultRange: Range | InsertReplaceRange | undefined;
    commitCharacters: string[] | undefined;
  } {
    const rangeDefaults = list.itemDefaults?.editRange;
    const commitCharacters = list.itemDefaults?.commitCharacters ?? allCommitCharacters;
    return ls.Range.is(rangeDefaults)
      ? { defaultRange: asRange(rangeDefaults), commitCharacters }
      : rangeDefaults !== undefined
        ? {
            defaultRange: {
              inserting: asRange(rangeDefaults.insert),
              replacing: asRange(rangeDefaults.replace),
            },
            commitCharacters,
          }
        : { defaultRange: undefined, commitCharacters };
  }

  function asCompletionItemKind(
    value: ls.CompletionItemKind,
  ): [CompletionItemKind, ls.CompletionItemKind | undefined] {
    // Protocol item kind is 1 based, codes item kind is zero based.
    if (
      ls.CompletionItemKind.Text <= value &&
      value <= ls.CompletionItemKind.TypeParameter
    ) {
      return [value - 1, undefined];
    }
    return [CompletionItemKind.Text, value];
  }

  function asCompletionItemTag(
    tag: ls.CompletionItemTag,
  ): CompletionItemTag | undefined {
    switch (tag) {
      case ls.CompletionItemTag.Deprecated:
        return CompletionItemTag.Deprecated;
    }
    return undefined;
  }

  function asCompletionItemTags(
    tags: ls.CompletionItemTag[] | undefined | null,
  ): CompletionItemTag[] {
    if (tags === undefined || tags === null) {
      return [];
    }
    const result: CompletionItemTag[] = [];
    for (const tag of tags) {
      const converted = asCompletionItemTag(tag);
      if (converted !== undefined) {
        result.push(converted);
      }
    }
    return result;
  }

  function asCompletionItem(
    item: ls.CompletionItem,
    defaultCommitCharacters?: string[],
    defaultRange?: Range | InsertReplaceRange,
    defaultInsertTextMode?: ls.InsertTextMode,
    defaultInsertTextFormat?: ls.InsertTextFormat,
    defaultData?: ls.LSPAny,
  ): ProtocolCompletionItem {
    const tags: CompletionItemTag[] = asCompletionItemTags(item.tags);
    const label = asCompletionItemLabel(item);
    const result = new ProtocolCompletionItem(label);

    if (item.detail) {
      result.detail = item.detail;
    }
    if (item.documentation) {
      result.documentation = asDocumentation(item.documentation);
      result.documentationFormat = Is.string(item.documentation)
        ? '$string'
        : item.documentation.kind;
    }
    if (item.filterText) {
      result.filterText = item.filterText;
    }
    const insertText = asCompletionInsertText(
      item,
      defaultRange,
      defaultInsertTextFormat,
    );
    if (insertText) {
      result.insertText = insertText.text;
      result.range = insertText.range;
      result.fromEdit = insertText.fromEdit;
    }
    if (Is.number(item.kind)) {
      const [itemKind, original] = asCompletionItemKind(item.kind);
      result.kind = itemKind;
      if (original) {
        result.originalItemKind = original;
      }
    }
    if (item.sortText) {
      result.sortText = item.sortText;
    }
    if (item.additionalTextEdits) {
      result.additionalTextEdits = asTextEditsSync(item.additionalTextEdits);
    }
    const commitCharacters =
      item.commitCharacters !== undefined
        ? Is.stringArray(item.commitCharacters)
          ? item.commitCharacters
          : undefined
        : defaultCommitCharacters;
    if (commitCharacters) {
      result.commitCharacters = commitCharacters.slice();
    }
    if (item.command) {
      result.command = asCommand(item.command);
    }
    if (item.deprecated === true || item.deprecated === false) {
      result.deprecated = item.deprecated;
      if (item.deprecated === true) {
        tags.push(CompletionItemTag.Deprecated);
      }
    }
    if (item.preselect === true || item.preselect === false) {
      result.preselect = item.preselect;
    }
    const data = item.data ?? defaultData;
    if (data !== undefined) {
      result.data = data;
    }
    if (tags.length > 0) {
      result.tags = tags;
    }
    const insertTextMode = item.insertTextMode ?? defaultInsertTextMode;
    if (insertTextMode !== undefined) {
      result.insertTextMode = insertTextMode;
      if (insertTextMode === ls.InsertTextMode.asIs) {
        result.keepWhitespace = true;
      }
    }
    return result;
  }

  function asCompletionItemLabel(
    item: ls.CompletionItem,
  ): CompletionItemLabel | string {
    if (ls.CompletionItemLabelDetails.is(item.labelDetails)) {
      return {
        label: item.label,
        detail: item.labelDetails.detail,
        description: item.labelDetails.description,
      };
    } else {
      return item.label;
    }
  }

  function asCompletionInsertText(
    item: ls.CompletionItem,
    defaultRange?: Range | InsertReplaceRange,
    defaultInsertTextFormat?: ls.InsertTextFormat,
  ):
    | {
        text: string | SnippetString;
        range?: Range | InsertReplaceRange;
        fromEdit: boolean;
      }
    | undefined {
    const insertTextFormat = item.insertTextFormat ?? defaultInsertTextFormat;
    if (item.textEdit !== undefined || defaultRange !== undefined) {
      const [range, newText] =
        item.textEdit !== undefined
          ? getCompletionRangeAndText(item.textEdit)
          : [defaultRange, item.textEditText ?? item.label];
      if (insertTextFormat === ls.InsertTextFormat.Snippet) {
        return { text: new SnippetString(newText), range: range, fromEdit: true };
      } else {
        return { text: newText, range: range, fromEdit: true };
      }
    } else if (item.insertText) {
      if (insertTextFormat === ls.InsertTextFormat.Snippet) {
        return { text: new SnippetString(item.insertText), fromEdit: false };
      } else {
        return { text: item.insertText, fromEdit: false };
      }
    } else {
      return undefined;
    }
  }

  function getCompletionRangeAndText(
    value: ls.TextEdit | ls.InsertReplaceEdit,
  ): [Range | InsertReplaceRange, string] {
    if (ls.InsertReplaceEdit.is(value)) {
      return [
        { inserting: asRange(value.insert), replacing: asRange(value.replace) },
        value.newText,
      ];
    } else {
      return [asRange(value.range), value.newText];
    }
  }

  function asTextEdit(edit: undefined | null): undefined;
  function asTextEdit(edit: ls.TextEdit): TextEdit;
  function asTextEdit(edit: ls.TextEdit | undefined | null): TextEdit | undefined {
    if (!edit) {
      return undefined;
    }
    return new TextEdit(asRange(edit.range), edit.newText);
  }

  function asTextEdits(
    items: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asTextEdits(
    items: ls.TextEdit[],
    token?: CancellationToken,
  ): Promise<TextEdit[]>;
  function asTextEdits(
    items: ls.TextEdit[] | undefined | null,
    token?: CancellationToken,
  ): Promise<TextEdit[] | undefined>;
  async function asTextEdits(
    items: ls.TextEdit[] | undefined | null,
    token?: CancellationToken,
  ): Promise<TextEdit[] | undefined> {
    if (!items) {
      return undefined;
    }
    return async.map(items, asTextEdit, token);
  }

  function asTextEditsSync(items: undefined | null): undefined;
  function asTextEditsSync(items: ls.TextEdit[]): TextEdit[];
  function asTextEditsSync(
    items: ls.TextEdit[] | undefined | null,
  ): TextEdit[] | undefined;
  function asTextEditsSync(
    items: ls.TextEdit[] | undefined | null,
  ): TextEdit[] | undefined {
    if (!items) {
      return undefined;
    }
    const result: TextEdit[] = new Array(items.length);
    for (let i = 0; i < items.length; i++) {
      result[i] = asTextEdit(items[i]);
    }
    return result;
  }

  function asSignatureHelp(
    item: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asSignatureHelp(
    item: ls.SignatureHelp,
    token?: CancellationToken,
  ): Promise<SignatureHelp>;
  function asSignatureHelp(
    item: ls.SignatureHelp | undefined | null,
    token?: CancellationToken,
  ): Promise<SignatureHelp | undefined>;
  async function asSignatureHelp(
    item: ls.SignatureHelp | undefined | null,
    token?: CancellationToken,
  ): Promise<SignatureHelp | undefined> {
    if (!item) {
      return undefined;
    }
    const result = new SignatureHelp();
    if (Is.number(item.activeSignature)) {
      result.activeSignature = item.activeSignature;
    } else {
      // activeSignature was optional in the past
      result.activeSignature = 0;
    }
    if (Is.number(item.activeParameter)) {
      result.activeParameter = item.activeParameter;
    } else if (item.activeParameter === null) {
      result.activeParameter = -1;
    } else {
      // activeParameter was optional in the past
      result.activeParameter = 0;
    }
    if (item.signatures) {
      result.signatures = await asSignatureInformations(item.signatures, token);
    }
    return result;
  }

  async function asSignatureInformations(
    items: ls.SignatureInformation[],
    token?: CancellationToken,
  ): Promise<SignatureInformation[]> {
    return async.mapAsync(items, asSignatureInformation, token);
  }

  async function asSignatureInformation(
    item: ls.SignatureInformation,
    token?: CancellationToken,
  ): Promise<SignatureInformation> {
    const result = new SignatureInformation(item.label);
    if (item.documentation !== undefined) {
      result.documentation = asDocumentation(item.documentation);
    }
    if (item.parameters !== undefined) {
      result.parameters = await asParameterInformations(item.parameters, token);
    }
    if (item.activeParameter !== undefined) {
      result.activeParameter = item.activeParameter ?? -1;
    }
    {
      return result;
    }
  }

  function asParameterInformations(
    items: ls.ParameterInformation[],
    token?: CancellationToken,
  ): Promise<ParameterInformation[]> {
    return async.map(items, asParameterInformation, token);
  }

  function asParameterInformation(item: ls.ParameterInformation): ParameterInformation {
    const result = new ParameterInformation(item.label);
    if (item.documentation) {
      result.documentation = asDocumentation(item.documentation);
    }
    return result;
  }

  function asLocation(item: undefined | null): undefined;
  function asLocation(item: ls.Location): Location;
  function asLocation(item: ls.Location | undefined | null): Location | undefined;
  function asLocation(item: ls.Location | undefined | null): Location | undefined {
    return item
      ? new Location(_uriConverter(item.uri), asRange(item.range))
      : undefined;
  }

  function asDeclarationResult(
    item: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asDeclarationResult(
    item: ls.Declaration,
    token?: CancellationToken,
  ): Promise<Location | Location[]>;
  function asDeclarationResult(
    item: ls.DeclarationLink[],
    token?: CancellationToken,
  ): Promise<LocationLink[]>;
  async function asDeclarationResult(
    item: ls.Declaration | ls.DeclarationLink[] | undefined | null,
    token?: CancellationToken,
  ): Promise<Declaration | undefined> {
    if (!item) {
      return undefined;
    }
    return asLocationResult(item, token);
  }

  function asDefinitionResult(
    item: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asDefinitionResult(
    item: ls.Definition,
    token?: CancellationToken,
  ): Promise<Definition>;
  function asDefinitionResult(
    item: ls.DefinitionLink[],
    token?: CancellationToken,
  ): Promise<DefinitionLink[]>;
  async function asDefinitionResult(
    item: ls.Definition | ls.DefinitionLink[] | undefined | null,
    token?: CancellationToken,
  ): Promise<Definition | DefinitionLink[] | undefined> {
    if (!item) {
      return undefined;
    }
    return asLocationResult(item, token);
  }

  function asLocationLink(item: undefined | null): undefined;
  function asLocationLink(item: ls.LocationLink): LocationLink;
  function asLocationLink(
    item: ls.LocationLink | undefined | null,
  ): LocationLink | undefined {
    if (!item) {
      return undefined;
    }
    const result = {
      targetUri: _uriConverter(item.targetUri),
      targetRange: asRange(item.targetRange), // See issue: https://github.com/Microsoft/vscode/issues/58649
      originSelectionRange: asRange(item.originSelectionRange),
      targetSelectionRange: asRange(item.targetSelectionRange),
    };
    if (!result.targetSelectionRange) {
      throw new Error(`targetSelectionRange must not be undefined or null`);
    }
    return result;
  }

  async function asLocationResult(
    item: ls.Location | ls.Location[] | ls.LocationLink[] | undefined | null,
    token?: CancellationToken,
  ): Promise<Location | Location[] | LocationLink[] | undefined> {
    if (!item) {
      return undefined;
    }
    if (Is.array(item)) {
      if (item.length === 0) {
        return [];
      } else if (ls.LocationLink.is(item[0])) {
        const links = item as ls.LocationLink[];
        return async.map(links, asLocationLink, token);
      } else {
        const locations = item as ls.Location[];
        return async.map(
          locations,
          asLocation as (item: ls.Location) => Location,
          token,
        );
      }
    } else if (ls.LocationLink.is(item)) {
      return [asLocationLink(item)];
    } else {
      return asLocation(item);
    }
  }

  function asReferences(
    values: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asReferences(
    values: ls.Location[],
    token?: CancellationToken,
  ): Promise<Location[]>;
  function asReferences(
    values: ls.Location[] | undefined | null,
    token?: CancellationToken,
  ): Promise<Location[] | undefined>;
  async function asReferences(
    values: ls.Location[] | undefined | null,
    token?: CancellationToken,
  ): Promise<Location[] | undefined> {
    if (!values) {
      return undefined;
    }
    return async.map(values, asLocation as (item: ls.Location) => Location, token);
  }

  function asDocumentHighlights(
    values: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asDocumentHighlights(
    values: ls.DocumentHighlight[],
    token?: CancellationToken,
  ): Promise<DocumentHighlight[]>;
  function asDocumentHighlights(
    values: ls.DocumentHighlight[] | undefined | null,
    token?: CancellationToken,
  ): Promise<DocumentHighlight[] | undefined>;
  async function asDocumentHighlights(
    values: ls.DocumentHighlight[] | undefined | null,
    token?: CancellationToken,
  ): Promise<DocumentHighlight[] | undefined> {
    if (!values) {
      return undefined;
    }
    return async.map(values, asDocumentHighlight, token);
  }

  function asDocumentHighlight(item: ls.DocumentHighlight): DocumentHighlight {
    const result = new DocumentHighlight(asRange(item.range));
    if (Is.number(item.kind)) {
      result.kind = asDocumentHighlightKind(item.kind);
    }
    return result;
  }

  function asDocumentHighlightKind(item: number): DocumentHighlightKind {
    switch (item) {
      case ls.DocumentHighlightKind.Text:
        return DocumentHighlightKind.Text;
      case ls.DocumentHighlightKind.Read:
        return DocumentHighlightKind.Read;
      case ls.DocumentHighlightKind.Write:
        return DocumentHighlightKind.Write;
    }
    return DocumentHighlightKind.Text;
  }

  function asSymbolInformations(
    values: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asSymbolInformations(
    values: ls.SymbolInformation[],
    token?: CancellationToken,
  ): Promise<SymbolInformation[]>;
  function asSymbolInformations(
    values: ls.SymbolInformation[] | undefined | null,
    token?: CancellationToken,
  ): Promise<SymbolInformation[] | undefined>;
  async function asSymbolInformations(
    values: ls.SymbolInformation[] | undefined | null,
    token?: CancellationToken,
  ): Promise<SymbolInformation[] | undefined> {
    if (!values) {
      return undefined;
    }
    return async.map(values, asSymbolInformation, token);
  }

  function asSymbolKind(item: ls.SymbolKind): SymbolKind {
    if (item <= ls.SymbolKind.TypeParameter) {
      // Symbol kind is one based in the protocol and zero based in
      return item - 1;
    }
    return SymbolKind.Property;
  }

  function asSymbolTag(value: ls.SymbolTag): SymbolTag | undefined {
    switch (value) {
      case ls.SymbolTag.Deprecated:
        return SymbolTag.Deprecated;
      default:
        return undefined;
    }
  }

  function asSymbolTags(items: undefined | null): undefined;
  function asSymbolTags(items: ReadonlyArray<ls.SymbolTag>): SymbolTag[];
  function asSymbolTags(
    items: ReadonlyArray<ls.SymbolTag> | undefined | null,
  ): SymbolTag[] | undefined;
  function asSymbolTags(
    items: ReadonlyArray<ls.SymbolTag> | undefined | null,
  ): SymbolTag[] | undefined {
    if (items === undefined || items === null) {
      return undefined;
    }
    const result: SymbolTag[] = [];
    for (const item of items) {
      const converted = asSymbolTag(item);
      if (converted !== undefined) {
        result.push(converted);
      }
    }
    return result.length === 0 ? undefined : result;
  }

  function asSymbolInformation(
    item: ls.SymbolInformation | ls.WorkspaceSymbol,
  ): SymbolInformation {
    const data: ls.LSPAny | undefined = (item as ls.WorkspaceSymbol).data;
    const location: Omit<ls.Location, 'range'> & { range?: ls.Range } = item.location;
    const result: SymbolInformation =
      location.range === undefined || data !== undefined
        ? new WorkspaceSymbol(
            item.name,
            asSymbolKind(item.kind),
            item.containerName ?? '',
            location.range === undefined
              ? _uriConverter(location.uri)
              : new Location(_uriConverter(item.location.uri), asRange(location.range)),
            data,
          )
        : new SymbolInformation(
            item.name,
            asSymbolKind(item.kind),
            item.containerName ?? '',
            new Location(_uriConverter(item.location.uri), asRange(location.range)),
          );
    fillTags(result, item);
    return result;
  }

  function asDocumentSymbols(
    values: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asDocumentSymbols(
    values: ls.DocumentSymbol[],
    token?: CancellationToken,
  ): Promise<DocumentSymbol[]>;
  async function asDocumentSymbols(
    values: ls.DocumentSymbol[] | undefined | null,
    token?: CancellationToken,
  ): Promise<DocumentSymbol[] | undefined> {
    if (values === undefined || values === null) {
      return undefined;
    }
    return async.map(values, asDocumentSymbol, token);
  }

  function asDocumentSymbol(value: ls.DocumentSymbol): DocumentSymbol {
    const result = new DocumentSymbol(
      value.name,
      value.detail || '',
      asSymbolKind(value.kind),
      asRange(value.range),
      asRange(value.selectionRange),
    );
    fillTags(result, value);
    if (value.children !== undefined && value.children.length > 0) {
      const children: DocumentSymbol[] = [];
      for (const child of value.children) {
        children.push(asDocumentSymbol(child));
      }
      result.children = children;
    }
    return result;
  }

  function fillTags(
    result: { tags?: ReadonlyArray<SymbolTag> },
    value: { tags?: ls.SymbolTag[]; deprecated?: boolean },
  ): void {
    result.tags = asSymbolTags(value.tags);
    if (value.deprecated) {
      if (!result.tags) {
        result.tags = [SymbolTag.Deprecated];
      } else {
        if (!result.tags.includes(SymbolTag.Deprecated)) {
          result.tags = result.tags.concat(SymbolTag.Deprecated);
        }
      }
    }
  }

  function asCommand(item: ls.Command): Command {
    const result: Command = { title: item.title, command: item.command };
    if (item.tooltip) {
      result.tooltip = item.tooltip;
    }
    if (item.arguments) {
      result.arguments = item.arguments;
    }
    return result;
  }

  function asCommands(
    items: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asCommands(
    items: ls.Command[],
    token?: CancellationToken,
  ): Promise<Command[]>;
  function asCommands(
    items: ls.Command[] | undefined | null,
    token?: CancellationToken,
  ): Promise<Command[] | undefined>;
  async function asCommands(
    items: ls.Command[] | undefined | null,
    token?: CancellationToken,
  ): Promise<Command[] | undefined> {
    if (!items) {
      return undefined;
    }
    return async.map(items, asCommand, token);
  }

  const kindMapping: Map<ls.CodeActionKind, CodeActionKind> = new Map();
  kindMapping.set(ls.CodeActionKind.Empty, CodeActionKind.Empty);
  kindMapping.set(ls.CodeActionKind.QuickFix, CodeActionKind.QuickFix);
  kindMapping.set(ls.CodeActionKind.Refactor, CodeActionKind.Refactor);
  kindMapping.set(ls.CodeActionKind.RefactorExtract, CodeActionKind.RefactorExtract);
  kindMapping.set(ls.CodeActionKind.RefactorInline, CodeActionKind.RefactorInline);
  kindMapping.set(ls.CodeActionKind.RefactorRewrite, CodeActionKind.RefactorRewrite);
  kindMapping.set(ls.CodeActionKind.Source, CodeActionKind.Source);
  kindMapping.set(
    ls.CodeActionKind.SourceOrganizeImports,
    CodeActionKind.SourceOrganizeImports,
  );

  function asCodeActionKind(item: null | undefined): undefined;
  function asCodeActionKind(item: ls.CodeActionKind): CodeActionKind;
  function asCodeActionKind(
    item: ls.CodeActionKind | null | undefined,
  ): CodeActionKind | undefined;
  function asCodeActionKind(
    item: ls.CodeActionKind | null | undefined,
  ): CodeActionKind | undefined {
    if (item === undefined || item === null) {
      return undefined;
    }
    let result: CodeActionKind | undefined = kindMapping.get(item);
    if (result) {
      return result;
    }
    const parts = item.split('.');
    result = CodeActionKind.Empty;
    for (const part of parts) {
      result = result.append(part);
    }
    return result;
  }

  function asCodeActionKinds(item: null | undefined): undefined;
  function asCodeActionKinds(items: ls.CodeActionKind[]): CodeActionKind[];
  function asCodeActionKinds(
    items: ls.CodeActionKind[] | null | undefined,
  ): CodeActionKind[] | undefined;
  function asCodeActionKinds(
    items: ls.CodeActionKind[] | null | undefined,
  ): CodeActionKind[] | undefined {
    if (items === undefined || items === null) {
      return undefined;
    }
    return items.map((kind) => asCodeActionKind(kind));
  }

  function asCodeActionDocumentations(items: null | undefined): undefined;
  function asCodeActionDocumentations(
    items: ls.CodeActionKindDocumentation[],
  ): CodeActionProviderMetadata['documentation'];
  function asCodeActionDocumentations(
    items: ls.CodeActionKindDocumentation[] | null | undefined,
  ): CodeActionProviderMetadata['documentation'] | undefined;
  function asCodeActionDocumentations(
    items: ls.CodeActionKindDocumentation[] | null | undefined,
  ): CodeActionProviderMetadata['documentation'] | undefined {
    if (items === undefined || items === null) {
      return undefined;
    }
    return items.map((doc) => ({
      kind: asCodeActionKind(doc.kind),
      command: asCommand(doc.command),
    }));
  }

  function asCodeAction(
    item: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asCodeAction(
    item: ls.CodeAction,
    token?: CancellationToken,
  ): Promise<CodeAction>;
  function asCodeAction(
    item: ls.CodeAction | undefined | null,
    token?: CancellationToken,
  ): Promise<CodeAction | undefined>;
  async function asCodeAction(
    item: ls.CodeAction | undefined | null,
    token?: CancellationToken,
  ): Promise<CodeAction | undefined> {
    if (item === undefined || item === null) {
      return undefined;
    }
    const result = new ProtocolCodeAction(item.title, item.data);
    if (item.kind !== undefined) {
      result.kind = asCodeActionKind(item.kind);
    }
    if (item.diagnostics !== undefined) {
      result.diagnostics = asDiagnosticsSync(item.diagnostics);
    }
    if (item.edit !== undefined) {
      result.edit = await asWorkspaceEdit(item.edit, token);
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

  function asCodeActionResult(
    items: (ls.Command | ls.CodeAction)[],
    token?: CancellationToken,
  ): Promise<(Command | CodeAction)[]> {
    return async.mapAsync(
      items,
      async (item) => {
        if (ls.Command.is(item)) {
          return asCommand(item);
        } else {
          return asCodeAction(item, token);
        }
      },
      token,
    );
  }

  function asCodeLens(item: undefined | null): undefined;
  function asCodeLens(item: ls.CodeLens): CodeLens;
  function asCodeLens(item: ls.CodeLens | undefined | null): CodeLens | undefined;
  function asCodeLens(item: ls.CodeLens | undefined | null): CodeLens | undefined {
    if (!item) {
      return undefined;
    }
    const result: ProtocolCodeLens = new ProtocolCodeLens(asRange(item.range));
    if (item.command) {
      result.command = asCommand(item.command);
    }
    if (item.data !== undefined && item.data !== null) {
      result.data = item.data;
    }
    return result;
  }

  function asCodeLenses(
    items: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asCodeLenses(
    items: ls.CodeLens[],
    token?: CancellationToken,
  ): Promise<CodeLens[]>;
  function asCodeLenses(
    items: ls.CodeLens[] | undefined | null,
    token?: CancellationToken,
  ): Promise<CodeLens[] | undefined>;
  async function asCodeLenses(
    items: ls.CodeLens[] | undefined | null,
    token?: CancellationToken,
  ): Promise<CodeLens[] | undefined> {
    if (!items) {
      return undefined;
    }
    return async.map(items, asCodeLens as (item: ls.CodeLens) => CodeLens, token);
  }

  function asWorkspaceEdit(
    item: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asWorkspaceEdit(
    item: ls.WorkspaceEdit,
    token?: CancellationToken,
  ): Promise<WorkspaceEdit>;
  function asWorkspaceEdit(
    item: ls.WorkspaceEdit | undefined | null,
    token?: CancellationToken,
  ): Promise<WorkspaceEdit | undefined>;
  async function asWorkspaceEdit(
    item: ls.WorkspaceEdit | undefined | null,
    token?: CancellationToken,
  ): Promise<WorkspaceEdit | undefined> {
    if (!item) {
      return undefined;
    }
    const sharedMetadata: Map<string, WorkspaceEditEntryMetadata> = new Map();
    if (item.changeAnnotations !== undefined) {
      const changeAnnotations = item.changeAnnotations;
      await async.forEach(
        Object.keys(changeAnnotations),
        (key) => {
          const metaData = asWorkspaceEditEntryMetadata(changeAnnotations[key]);
          sharedMetadata.set(key, metaData);
        },
        token,
      );
    }
    const asMetadata = (
      annotation: ls.ChangeAnnotationIdentifier | undefined,
    ): WorkspaceEditEntryMetadata | undefined => {
      if (annotation === undefined) {
        return undefined;
      } else {
        return sharedMetadata.get(annotation);
      }
    };
    const result = new WorkspaceEdit();
    if (item.documentChanges) {
      const documentChanges = item.documentChanges;
      await async.forEach(
        documentChanges,
        (change) => {
          if (ls.CreateFile.is(change)) {
            result.createFile(
              _uriConverter(change.uri),
              change.options,
              asMetadata(change.annotationId),
            );
          } else if (ls.RenameFile.is(change)) {
            result.renameFile(
              _uriConverter(change.oldUri),
              _uriConverter(change.newUri),
              change.options,
              asMetadata(change.annotationId),
            );
          } else if (ls.DeleteFile.is(change)) {
            result.deleteFile(
              _uriConverter(change.uri),
              change.options,
              asMetadata(change.annotationId),
            );
          } else if (ls.TextDocumentEdit.is(change)) {
            const uri = _uriConverter(change.textDocument.uri);
            for (const edit of change.edits) {
              if (ls.AnnotatedTextEdit.is(edit)) {
                result.replace(
                  uri,
                  asRange(edit.range),
                  edit.newText,
                  asMetadata(edit.annotationId),
                );
              } else {
                result.replace(uri, asRange(edit.range), edit.newText);
              }
            }
          } else {
            throw new Error(
              `Unknown workspace edit change received:\n${JSON.stringify(
                change,
                undefined,
                4,
              )}`,
            );
          }
        },
        token,
      );
    } else if (item.changes) {
      const changes = item.changes;
      await async.forEach(
        Object.keys(changes),
        (key) => {
          result.set(_uriConverter(key), asTextEditsSync(changes[key]));
        },
        token,
      );
    }
    return result;
  }

  function asWorkspaceEditEntryMetadata(annotation: undefined): undefined;
  function asWorkspaceEditEntryMetadata(
    annotation: ls.ChangeAnnotation,
  ): WorkspaceEditEntryMetadata;
  function asWorkspaceEditEntryMetadata(
    annotation: ls.ChangeAnnotation | undefined,
  ): WorkspaceEditEntryMetadata | undefined;
  function asWorkspaceEditEntryMetadata(
    annotation: ls.ChangeAnnotation | undefined,
  ): WorkspaceEditEntryMetadata | undefined {
    if (annotation === undefined) {
      return undefined;
    }
    return {
      label: annotation.label,
      needsConfirmation: !!annotation.needsConfirmation,
      description: annotation.description,
    };
  }

  function asDocumentLink(item: ls.DocumentLink): DocumentLink {
    const range = asRange(item.range);
    const target = item.target ? asUri(item.target) : undefined;
    // target must be optional in DocumentLink
    const link = new ProtocolDocumentLink(range, target);
    if (item.tooltip !== undefined) {
      link.tooltip = item.tooltip;
    }
    if (item.data !== undefined && item.data !== null) {
      link.data = item.data;
    }
    return link;
  }

  function asDocumentLinks(
    items: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asDocumentLinks(
    items: ls.DocumentLink[],
    token?: CancellationToken,
  ): Promise<DocumentLink[]>;
  function asDocumentLinks(
    items: ls.DocumentLink[] | undefined | null,
    token?: CancellationToken,
  ): Promise<DocumentLink[] | undefined>;
  async function asDocumentLinks(
    items: ls.DocumentLink[] | undefined | null,
    token?: CancellationToken,
  ): Promise<DocumentLink[] | undefined> {
    if (!items) {
      return undefined;
    }
    return async.map(items, asDocumentLink, token);
  }

  function asColor(color: ls.Color): Color {
    return new Color(color.red, color.green, color.blue, color.alpha);
  }

  function asColorInformation(ci: ls.ColorInformation): ColorInformation {
    return new ColorInformation(asRange(ci.range), asColor(ci.color));
  }

  function asColorInformations(
    colorInformation: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asColorInformations(
    colorInformation: ls.ColorInformation[],
    token?: CancellationToken,
  ): Promise<ColorInformation[]>;
  async function asColorInformations(
    colorInformation: ls.ColorInformation[] | undefined | null,
    token?: CancellationToken,
  ): Promise<ColorInformation[] | undefined> {
    if (!colorInformation) {
      return undefined;
    }
    return async.map(colorInformation, asColorInformation, token);
  }

  function asColorPresentation(cp: ls.ColorPresentation): ColorPresentation {
    const presentation = new ColorPresentation(cp.label);
    presentation.additionalTextEdits = asTextEditsSync(cp.additionalTextEdits);
    if (cp.textEdit) {
      presentation.textEdit = asTextEdit(cp.textEdit);
    }
    return presentation;
  }

  function asColorPresentations(
    colorPresentations: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asColorPresentations(
    colorPresentations: ls.ColorPresentation[],
    token?: CancellationToken,
  ): Promise<ColorPresentation[]>;
  async function asColorPresentations(
    colorPresentations: ls.ColorPresentation[] | undefined | null,
    token?: CancellationToken,
  ): Promise<ColorPresentation[] | undefined> {
    if (!colorPresentations) {
      return undefined;
    }
    return async.map(colorPresentations, asColorPresentation, token);
  }

  function asFoldingRangeKind(kind: string | undefined): FoldingRangeKind | undefined {
    if (kind) {
      switch (kind) {
        case ls.FoldingRangeKind.Comment:
          return FoldingRangeKind.Comment;
        case ls.FoldingRangeKind.Imports:
          return FoldingRangeKind.Imports;
        case ls.FoldingRangeKind.Region:
          return FoldingRangeKind.Region;
      }
    }
    return undefined;
  }

  function asFoldingRange(r: ls.FoldingRange): FoldingRange {
    return new FoldingRange(r.startLine, r.endLine, asFoldingRangeKind(r.kind));
  }

  function asFoldingRanges(
    foldingRanges: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asFoldingRanges(
    foldingRanges: ls.FoldingRange[],
    token?: CancellationToken,
  ): Promise<FoldingRange[]>;
  function asFoldingRanges(
    foldingRanges: ls.FoldingRange[] | undefined | null,
    token?: CancellationToken,
  ): Promise<FoldingRange[] | undefined>;
  async function asFoldingRanges(
    foldingRanges: ls.FoldingRange[] | undefined | null,
    token?: CancellationToken,
  ): Promise<FoldingRange[] | undefined> {
    if (!foldingRanges) {
      return undefined;
    }
    return async.map(foldingRanges, asFoldingRange, token);
  }

  function asSelectionRange(selectionRange: ls.SelectionRange): SelectionRange {
    return new SelectionRange(
      asRange(selectionRange.range),
      selectionRange.parent ? asSelectionRange(selectionRange.parent) : undefined,
    );
  }

  function asSelectionRanges(
    selectionRanges: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asSelectionRanges(
    selectionRanges: ls.SelectionRange[],
    token?: CancellationToken,
  ): Promise<SelectionRange[]>;
  function asSelectionRanges(
    selectionRanges: ls.SelectionRange[] | undefined | null,
    token?: CancellationToken,
  ): Promise<SelectionRange[] | undefined>;
  async function asSelectionRanges(
    selectionRanges: ls.SelectionRange[] | undefined | null,
    token?: CancellationToken,
  ): Promise<SelectionRange[] | undefined> {
    if (!Array.isArray(selectionRanges)) {
      return [];
    }
    return async.map(selectionRanges, asSelectionRange, token);
  }

  function asInlineValue(inlineValue: ls.InlineValue): InlineValue {
    if (ls.InlineValueText.is(inlineValue)) {
      return new InlineValueText(asRange(inlineValue.range), inlineValue.text);
    } else if (ls.InlineValueVariableLookup.is(inlineValue)) {
      return new InlineValueVariableLookup(
        asRange(inlineValue.range),
        inlineValue.variableName,
        inlineValue.caseSensitiveLookup,
      );
    } else {
      return new InlineValueEvaluatableExpression(
        asRange(inlineValue.range),
        inlineValue.expression,
      );
    }
  }

  function asInlineValues(
    inlineValues: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asInlineValues(
    inlineValues: ls.InlineValue[],
    token?: CancellationToken,
  ): Promise<SelectionRange[]>;
  function asInlineValues(
    inlineValues: ls.InlineValue[] | undefined | null,
    token?: CancellationToken,
  ): Promise<InlineValue[] | undefined>;
  async function asInlineValues(
    inlineValues: ls.InlineValue[] | undefined | null,
    token?: CancellationToken,
  ): Promise<InlineValue[] | undefined> {
    if (!Array.isArray(inlineValues)) {
      return [];
    }
    return async.map(inlineValues, asInlineValue, token);
  }

  async function asInlayHint(
    value: ls.InlayHint,
    token?: CancellationToken,
  ): Promise<InlayHint> {
    const label =
      typeof value.label === 'string'
        ? value.label
        : await async.map(value.label, asInlayHintLabelPart, token);
    const result = new ProtocolInlayHint(asPosition(value.position), label);
    if (value.kind !== undefined) {
      result.kind = value.kind;
    }
    if (value.textEdits !== undefined) {
      result.textEdits = await asTextEdits(value.textEdits, token);
    }
    if (value.tooltip !== undefined) {
      result.tooltip = asTooltip(value.tooltip);
    }
    if (value.paddingLeft !== undefined) {
      result.paddingLeft = value.paddingLeft;
    }
    if (value.paddingRight !== undefined) {
      result.paddingRight = value.paddingRight;
    }
    if (value.data !== undefined) {
      result.data = value.data;
    }
    return result;
  }

  function asInlayHintLabelPart(part: ls.InlayHintLabelPart): InlayHintLabelPart {
    const result = new InlayHintLabelPart(part.value);
    if (part.location !== undefined) {
      result.location = asLocation(part.location);
    }
    if (part.tooltip !== undefined) {
      result.tooltip = asTooltip(part.tooltip);
    }
    if (part.command !== undefined) {
      result.command = asCommand(part.command);
    }
    return result;
  }

  function asTooltip(value: string | ls.MarkupContent): string | VMarkdownString {
    if (typeof value === 'string') {
      return value;
    }
    return asMarkdownString(value);
  }

  function asInlayHints(
    values: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asInlayHints(
    values: ls.InlayHint[],
    token?: CancellationToken,
  ): Promise<InlayHint[]>;
  function asInlayHints(
    values: ls.InlayHint[] | undefined | null,
    token?: CancellationToken,
  ): Promise<InlayHint[] | undefined>;
  async function asInlayHints(
    values: ls.InlayHint[] | undefined | null,
    token?: CancellationToken,
  ): Promise<InlayHint[] | undefined> {
    if (!Array.isArray(values)) {
      return undefined;
    }
    return async.mapAsync(values, asInlayHint, token);
  }

  //----- call hierarchy

  function asCallHierarchyItem(item: null): undefined;
  function asCallHierarchyItem(item: ls.CallHierarchyItem): CallHierarchyItem;
  function asCallHierarchyItem(
    item: ls.CallHierarchyItem | null,
  ): CallHierarchyItem | undefined;
  function asCallHierarchyItem(
    item: ls.CallHierarchyItem | null,
  ): CallHierarchyItem | undefined {
    if (item === null) {
      return undefined;
    }
    const result = new ProtocolCallHierarchyItem(
      asSymbolKind(item.kind),
      item.name,
      item.detail || '',
      asUri(item.uri),
      asRange(item.range),
      asRange(item.selectionRange),
      item.data,
    );
    if (item.tags !== undefined) {
      result.tags = asSymbolTags(item.tags);
    }
    return result;
  }

  function asCallHierarchyItems(
    items: null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asCallHierarchyItems(
    items: ls.CallHierarchyItem[],
    token?: CancellationToken,
  ): Promise<CallHierarchyItem[]>;
  function asCallHierarchyItems(
    items: ls.CallHierarchyItem[] | null,
    token?: CancellationToken,
  ): Promise<CallHierarchyItem[] | undefined>;
  async function asCallHierarchyItems(
    items: ls.CallHierarchyItem[] | null,
    token?: CancellationToken,
  ): Promise<CallHierarchyItem[] | undefined> {
    if (items === null) {
      return undefined;
    }
    return async.map(
      items,
      asCallHierarchyItem as (item: ls.CallHierarchyItem) => CallHierarchyItem,
      token,
    );
  }

  async function asCallHierarchyIncomingCall(
    item: ls.CallHierarchyIncomingCall,
    token?: CancellationToken,
  ): Promise<CallHierarchyIncomingCall> {
    return new CallHierarchyIncomingCall(
      asCallHierarchyItem(item.from),
      await asRanges(item.fromRanges, token),
    );
  }
  function asCallHierarchyIncomingCalls(
    items: null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asCallHierarchyIncomingCalls(
    items: ReadonlyArray<ls.CallHierarchyIncomingCall>,
    token?: CancellationToken,
  ): Promise<CallHierarchyIncomingCall[]>;
  function asCallHierarchyIncomingCalls(
    items: ReadonlyArray<ls.CallHierarchyIncomingCall> | null,
    token?: CancellationToken,
  ): Promise<CallHierarchyIncomingCall[] | undefined>;
  async function asCallHierarchyIncomingCalls(
    items: ReadonlyArray<ls.CallHierarchyIncomingCall> | null,
    token?: CancellationToken,
  ): Promise<CallHierarchyIncomingCall[] | undefined> {
    if (items === null) {
      return undefined;
    }
    return async.mapAsync(items, asCallHierarchyIncomingCall, token);
  }

  async function asCallHierarchyOutgoingCall(
    item: ls.CallHierarchyOutgoingCall,
    token?: CancellationToken,
  ): Promise<CallHierarchyOutgoingCall> {
    return new CallHierarchyOutgoingCall(
      asCallHierarchyItem(item.to),
      await asRanges(item.fromRanges, token),
    );
  }

  function asCallHierarchyOutgoingCalls(
    items: null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asCallHierarchyOutgoingCalls(
    items: ReadonlyArray<ls.CallHierarchyOutgoingCall>,
    token?: CancellationToken,
  ): Promise<CallHierarchyOutgoingCall[]>;
  function asCallHierarchyOutgoingCalls(
    items: ReadonlyArray<ls.CallHierarchyOutgoingCall> | null,
    token?: CancellationToken,
  ): Promise<CallHierarchyOutgoingCall[] | undefined>;
  async function asCallHierarchyOutgoingCalls(
    items: ReadonlyArray<ls.CallHierarchyOutgoingCall> | null,
    token?: CancellationToken,
  ): Promise<CallHierarchyOutgoingCall[] | undefined> {
    if (items === null) {
      return undefined;
    }
    return async.mapAsync(items, asCallHierarchyOutgoingCall, token);
  }

  //----- semantic tokens

  function asSemanticTokens(
    value: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asSemanticTokens(
    value: ls.SemanticTokens,
    token?: CancellationToken,
  ): Promise<SemanticTokens>;
  function asSemanticTokens(
    value: ls.SemanticTokens | undefined | null,
    token?: CancellationToken,
  ): Promise<SemanticTokens | undefined>;
  async function asSemanticTokens(
    value: ls.SemanticTokens | undefined | null,
    _token?: CancellationToken,
  ): Promise<SemanticTokens | undefined> {
    if (value === undefined || value === null) {
      return undefined;
    }
    return new SemanticTokens(new Uint32Array(value.data), value.resultId);
  }

  function asSemanticTokensEdit(value: ls.SemanticTokensEdit): SemanticTokensEdit {
    return new SemanticTokensEdit(
      value.start,
      value.deleteCount,
      value.data !== undefined ? new Uint32Array(value.data) : undefined,
    );
  }

  function asSemanticTokensEdits(
    value: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asSemanticTokensEdits(
    value: ls.SemanticTokensDelta,
    token?: CancellationToken,
  ): Promise<SemanticTokensEdits>;
  function asSemanticTokensEdits(
    value: ls.SemanticTokensDelta | undefined | null,
    token?: CancellationToken,
  ): Promise<SemanticTokensEdits | undefined>;
  async function asSemanticTokensEdits(
    value: ls.SemanticTokensDelta | undefined | null,
    _token?: CancellationToken,
  ): Promise<SemanticTokensEdits | undefined> {
    if (value === undefined || value === null) {
      return undefined;
    }
    return new SemanticTokensEdits(
      value.edits.map(asSemanticTokensEdit),
      value.resultId,
    );
  }

  function asSemanticTokensLegend(
    value: ls.SemanticTokensLegend,
  ): SemanticTokensLegend {
    return value;
  }

  function asLinkedEditingRanges(
    value: null | undefined,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asLinkedEditingRanges(
    value: ls.LinkedEditingRanges,
    token?: CancellationToken,
  ): Promise<LinkedEditingRanges>;
  function asLinkedEditingRanges(
    value: ls.LinkedEditingRanges | null | undefined,
    token?: CancellationToken,
  ): Promise<LinkedEditingRanges | undefined>;
  async function asLinkedEditingRanges(
    value: ls.LinkedEditingRanges | null | undefined,
    token?: CancellationToken,
  ): Promise<LinkedEditingRanges | undefined> {
    if (value === null || value === undefined) {
      return undefined;
    }
    return new LinkedEditingRanges(
      await asRanges(value.ranges, token),
      asRegularExpression(value.wordPattern),
    );
  }

  function asRegularExpression(value: null | undefined): undefined;
  function asRegularExpression(value: string): RegExp;
  function asRegularExpression(value: string | null | undefined): RegExp | undefined;
  function asRegularExpression(value: string | null | undefined): RegExp | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    return new RegExp(value);
  }

  //------ Type Hierarchy
  function asTypeHierarchyItem(item: null): undefined;
  function asTypeHierarchyItem(item: ls.TypeHierarchyItem): TypeHierarchyItem;
  function asTypeHierarchyItem(
    item: ls.TypeHierarchyItem | null,
  ): TypeHierarchyItem | undefined;
  function asTypeHierarchyItem(
    item: ls.TypeHierarchyItem | null,
  ): TypeHierarchyItem | undefined {
    if (item === null) {
      return undefined;
    }
    const result = new ProtocolTypeHierarchyItem(
      asSymbolKind(item.kind),
      item.name,
      item.detail || '',
      asUri(item.uri),
      asRange(item.range),
      asRange(item.selectionRange),
      item.data,
    );
    if (item.tags !== undefined) {
      result.tags = asSymbolTags(item.tags);
    }
    return result;
  }

  function asTypeHierarchyItems(
    items: null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asTypeHierarchyItems(
    items: ls.TypeHierarchyItem[],
    token?: CancellationToken,
  ): Promise<TypeHierarchyItem[]>;
  function asTypeHierarchyItems(
    items: ls.TypeHierarchyItem[] | null,
    token?: CancellationToken,
  ): Promise<TypeHierarchyItem[] | undefined>;
  async function asTypeHierarchyItems(
    items: ls.TypeHierarchyItem[] | null,
    token?: CancellationToken,
  ): Promise<TypeHierarchyItem[] | undefined> {
    if (items === null) {
      return undefined;
    }
    return async.map(
      items,
      asTypeHierarchyItem as (item: ls.TypeHierarchyItem) => TypeHierarchyItem,
      token,
    );
  }

  function asGlobPattern(pattern: ls.GlobPattern): GlobPattern | undefined {
    if (Is.string(pattern)) {
      return pattern;
    }
    if (ls.RelativePattern.is(pattern)) {
      if (ls.URI.is(pattern.baseUri)) {
        return new RelativePattern(asUri(pattern.baseUri), pattern.pattern);
      } else if (ls.WorkspaceFolder.is(pattern.baseUri)) {
        const workspaceFolder = workspace.getWorkspaceFolder(
          asUri(pattern.baseUri.uri),
        );
        return workspaceFolder !== undefined
          ? new RelativePattern(workspaceFolder, pattern.pattern)
          : undefined;
      }
    }
    return undefined;
  }

  function asInlineCompletionResult(
    value: undefined | null,
    token?: CancellationToken,
  ): Promise<undefined>;
  function asInlineCompletionResult(
    value: ls.InlineCompletionList,
    token?: CancellationToken,
  ): Promise<InlineCompletionList>;
  function asInlineCompletionResult(
    value: ls.InlineCompletionItem[],
    token?: CancellationToken,
  ): Promise<InlineCompletionItem[]>;
  function asInlineCompletionResult(
    value: ls.InlineCompletionItem[] | ls.InlineCompletionList | undefined | null,
    token?: CancellationToken,
  ): Promise<InlineCompletionItem[] | InlineCompletionList | undefined>;
  async function asInlineCompletionResult(
    value: ls.InlineCompletionItem[] | ls.InlineCompletionList | undefined | null,
    token?: CancellationToken,
  ): Promise<InlineCompletionItem[] | InlineCompletionList | undefined> {
    if (!value) {
      return undefined;
    }
    if (Array.isArray(value)) {
      return async.map(value, (item) => asInlineCompletionItem(item), token);
    }
    const list = <ls.InlineCompletionList>value;
    const converted = await async.map(
      list.items,
      (item) => {
        return asInlineCompletionItem(item);
      },
      token,
    );
    return new InlineCompletionList(converted);
  }

  function asInlineCompletionItem(item: ls.InlineCompletionItem): InlineCompletionItem {
    let insertText: string | SnippetString;
    if (typeof item.insertText === 'string') {
      insertText = item.insertText;
    } else {
      insertText = new SnippetString(item.insertText.value).value;
    }

    let command: Command | undefined = undefined;
    if (item.command) {
      command = asCommand(item.command);
    }

    const inlineCompletionItem = new InlineCompletionItem(
      insertText,
      asRange(item.range),
      command,
    );

    if (item.filterText) {
      inlineCompletionItem.filterText = item.filterText;
    }

    return inlineCompletionItem;
  }

  // new

  function asTextDcouemnt(value: ls.TextDocumentIdentifier): TextDocument {
    return {
      uri: URI.parse(value.uri),
    } as TextDocument;
  }

  return {
    asUri,
    asDocumentSelector,
    asDiagnostics,
    asDiagnostic,
    asRange,
    asRanges,
    asPosition,
    asDiagnosticSeverity,
    asDiagnosticTag,
    asHover,
    asCompletionResult,
    asCompletionItem,
    asTextEdit,
    asTextEdits,
    asSignatureHelp,
    asSignatureInformations,
    asSignatureInformation,
    asParameterInformations,
    asParameterInformation,
    asDeclarationResult,
    asDefinitionResult,
    asLocation,
    asReferences,
    asDocumentHighlights,
    asDocumentHighlight,
    asDocumentHighlightKind,
    asSymbolKind,
    asSymbolTag,
    asSymbolTags,
    asSymbolInformations,
    asSymbolInformation,
    asDocumentSymbols,
    asDocumentSymbol,
    asCommand,
    asCommands,
    asCodeAction,
    asCodeActionKind,
    asCodeActionKinds,
    asCodeActionDocumentations,
    asCodeActionResult,
    asCodeLens,
    asCodeLenses,
    asWorkspaceEdit,
    asDocumentLink,
    asDocumentLinks,
    asFoldingRangeKind,
    asFoldingRange,
    asFoldingRanges,
    asColor,
    asColorInformation,
    asColorInformations,
    asColorPresentation,
    asColorPresentations,
    asSelectionRange,
    asSelectionRanges,
    asInlineValue,
    asInlineValues,
    asInlayHint,
    asInlayHints,
    asSemanticTokensLegend,
    asSemanticTokens,
    asSemanticTokensEdit,
    asSemanticTokensEdits,
    asCallHierarchyItem,
    asCallHierarchyItems,
    asCallHierarchyIncomingCall,
    asCallHierarchyIncomingCalls,
    asCallHierarchyOutgoingCall,
    asCallHierarchyOutgoingCalls,
    asLinkedEditingRanges: asLinkedEditingRanges,
    asTypeHierarchyItem,
    asTypeHierarchyItems,
    asGlobPattern,
    asInlineCompletionResult,
    asInlineCompletionItem,
    // new
    asTextDcouemnt,
  };
}
