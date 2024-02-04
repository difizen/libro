/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

export * from '@difizen/vscode-languageserver-protocol';

export type {
  Converter as Code2ProtocolConverter,
  FileFormattingOptions,
} from './codeConverter.js';
export type { Converter as Protocol2CodeConverter } from './protocolConverter.js';

export * from './features.js';

export type {
  PrepareCallHierarchySignature,
  CallHierarchyIncomingCallsSignature,
  CallHierarchyOutgoingCallsSignature,
  CallHierarchyMiddleware,
} from './callHierarchy.js';
export type {
  ProvideCodeActionsSignature,
  ResolveCodeActionSignature,
  CodeActionMiddleware,
} from './codeAction.js';
export type {
  ProvideCodeLensesSignature,
  ResolveCodeLensSignature,
  CodeLensMiddleware,
  CodeLensProviderShape,
} from './codeLens.js';
export type {
  ProvideDocumentColorsSignature,
  ProvideColorPresentationSignature,
  ColorProviderMiddleware,
} from './colorProvider.js';
export type {
  ProvideCompletionItemsSignature,
  ResolveCompletionItemSignature,
  CompletionMiddleware,
} from './completion.js';
export type {
  ConfigurationMiddleware,
  DidChangeConfigurationSignature,
  DidChangeConfigurationMiddleware,
  SynchronizeOptions,
} from './configuration.js';
export type {
  ProvideDeclarationSignature,
  DeclarationMiddleware,
} from './declaration.js';
export type { ProvideDefinitionSignature, DefinitionMiddleware } from './definition.js';
export { vsdiag, DiagnosticPullMode } from './diagnostic.js';
export type {
  ProvideDiagnosticSignature,
  ProvideWorkspaceDiagnosticSignature,
  DiagnosticProviderMiddleware,
  DiagnosticPullOptions,
  DiagnosticProviderShape,
} from './diagnostic.js';
export type {
  ProvideDocumentHighlightsSignature,
  DocumentHighlightMiddleware,
} from './documentHighlight.js';
export type {
  ProvideDocumentLinksSignature,
  ResolveDocumentLinkSignature,
  DocumentLinkMiddleware,
} from './documentLink.js';
export type {
  ProvideDocumentSymbolsSignature,
  DocumentSymbolMiddleware,
} from './documentSymbol.js';
export type {
  ExecuteCommandSignature,
  ExecuteCommandMiddleware,
} from './executeCommand.js';
export type { FileOperationsMiddleware } from './fileOperations.js';
export type {
  ProvideFoldingRangeSignature,
  FoldingRangeProviderMiddleware,
} from './foldingRange.js';
export type {
  ProvideDocumentFormattingEditsSignature,
  ProvideDocumentRangeFormattingEditsSignature,
  ProvideOnTypeFormattingEditsSignature,
  FormattingMiddleware,
} from './formatting.js';
export type { ProvideHoverSignature, HoverMiddleware } from './hover.js';
export type {
  ProvideImplementationSignature,
  ImplementationMiddleware,
} from './implementation.js';
export type {
  ProvideInlayHintsSignature,
  ResolveInlayHintSignature,
  InlayHintsMiddleware,
  InlayHintsProviderShape,
} from './inlayHint.js';
export type {
  ProvideInlineValuesSignature,
  InlineValueMiddleware,
  InlineValueProviderShape,
} from './inlineValue.js';
export type {
  ProvideLinkedEditingRangeSignature,
  LinkedEditingRangeMiddleware,
} from './linkedEditingRange.js';
export type {
  NotebookDocumentOptions,
  NotebookDocumentMiddleware,
  NotebookDocumentSyncFeatureShape,
  VNotebookDocumentChangeEvent,
} from './notebook.js';
export type { ProvideReferencesSignature, ReferencesMiddleware } from './reference.js';
export type {
  ProvideRenameEditsSignature,
  PrepareRenameSignature,
  RenameMiddleware,
} from './rename.js';
export type {
  ProvideSelectionRangeSignature,
  SelectionRangeProviderMiddleware,
} from './selectionRange.js';
export type {
  DocumentSemanticsTokensSignature,
  DocumentSemanticsTokensEditsSignature,
  DocumentRangeSemanticTokensSignature,
  SemanticTokensMiddleware,
  SemanticTokensProviderShape,
} from './semanticTokens.js';
export type {
  ProvideSignatureHelpSignature,
  SignatureHelpMiddleware,
} from './signatureHelp.js';
export type {
  TextDocumentSynchronizationMiddleware,
  DidOpenTextDocumentFeatureShape,
  DidCloseTextDocumentFeatureShape,
  DidChangeTextDocumentFeatureShape,
  DidSaveTextDocumentFeatureShape,
} from './textSynchronization.js';
export type {
  ProvideTypeDefinitionSignature,
  TypeDefinitionMiddleware,
} from './typeDefinition.js';
export type { WorkspaceFolderMiddleware } from './workspaceFolder.js';
export type {
  ProvideWorkspaceSymbolsSignature,
  ResolveWorkspaceSymbolSignature,
  WorkspaceSymbolMiddleware,
} from './workspaceSymbol.js';

export * from './client.js';
