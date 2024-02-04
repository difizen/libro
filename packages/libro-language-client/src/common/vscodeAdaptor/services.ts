import type {
  NotebookDocument,
  WorkspaceFolder,
  WorkspaceFoldersChangeEvent,
  ConfigurationChangeEvent,
  ConfigurationScope,
  WorkspaceConfiguration,
  WorkspaceEdit,
  WorkspaceEditMetadata,
  NotebookDocumentChangeEvent,
  TextDocumentWillSaveEvent,
  TextDocumentChangeEvent,
  FileCreateEvent,
  FileRenameEvent,
  FileWillRenameEvent,
  FileDeleteEvent,
  FileWillDeleteEvent,
  FileWillCreateEvent,
  GlobPattern,
  FileSystemWatcher,
  TextDocument,
} from 'vscode';
import type {
  TabGroups,
  TextEditor,
  Event,
  OutputChannel,
  MessageOptions,
  MessageItem,
  Uri,
  ProgressOptions,
  Progress,
  ViewColumn,
  TextDocumentShowOptions,
  CancellationToken,
} from 'vscode';
import type {
  DiagnosticCollection,
  DocumentSelector,
  Disposable,
  CallHierarchyProvider,
  CodeActionProviderMetadata,
  CodeActionProvider,
  CompletionItemProvider,
  DocumentSemanticTokensProvider,
  CodeLensProvider,
  DeclarationProvider,
  DefinitionProvider,
  DocumentColorProvider,
  DocumentFormattingEditProvider,
  DocumentHighlightProvider,
  DocumentLinkProvider,
  DocumentRangeFormattingEditProvider,
  DocumentRangeSemanticTokensProvider,
  DocumentSymbolProvider,
  DocumentSymbolProviderMetadata,
  FoldingRangeProvider,
  HoverProvider,
  ImplementationProvider,
  InlineCompletionItemProvider,
  InlineValuesProvider,
  LanguageConfiguration,
  LinkedEditingRangeProvider,
  OnTypeFormattingEditProvider,
  ReferenceProvider,
  RenameProvider,
  SelectionRangeProvider,
  SemanticTokensLegend,
  SignatureHelpProvider,
  SignatureHelpProviderMetadata,
  TypeDefinitionProvider,
  TypeHierarchyProvider,
  WorkspaceSymbolProvider,
  InlayHintsProvider,
  FileSystem,
} from 'vscode';

export const ILibroWorkspace = Symbol('ILibroWorkspace');
export interface ILibroWorkspace {
  workspaceFolders: WorkspaceFolder[] | undefined;
  getWorkspaceFolder(uri: Uri): WorkspaceFolder | undefined;
  notebookDocuments: NotebookDocument[];
  textDocuments: TextDocument[];
  fs: FileSystem;
  onDidChangeWorkspaceFolders: Event<WorkspaceFoldersChangeEvent>;
  onDidChangeConfiguration: Event<ConfigurationChangeEvent>;
  getConfiguration(
    section?: string | undefined,
    scope?: ConfigurationScope | null | undefined,
  ): WorkspaceConfiguration;
  applyEdit(edit: WorkspaceEdit, metadata?: WorkspaceEditMetadata): Thenable<boolean>;
  onDidOpenNotebookDocument: Event<NotebookDocument>;
  onDidSaveNotebookDocument: Event<NotebookDocument>;
  onDidCloseNotebookDocument: Event<NotebookDocument>;
  onDidChangeNotebookDocument: Event<NotebookDocumentChangeEvent>;
  onDidOpenTextDocument: Event<TextDocument>;
  onDidSaveTextDocument: Event<TextDocument>;
  onWillSaveTextDocument: Event<TextDocumentWillSaveEvent>;
  onDidCloseTextDocument: Event<TextDocument>;
  onDidChangeTextDocument: Event<TextDocumentChangeEvent>;
  onDidCreateFiles: Event<FileCreateEvent>;
  onDidRenameFiles: Event<FileRenameEvent>;
  onWillRenameFiles: Event<FileWillRenameEvent>;
  onDidDeleteFiles: Event<FileDeleteEvent>;
  onWillDeleteFiles: Event<FileWillDeleteEvent>;
  onWillCreateFiles: Event<FileWillCreateEvent>;
  createFileSystemWatcher(
    pattern: GlobPattern,
    optionsOrIgnoreCreate: any,
    ignoreChange?: boolean,
    ignoreDelete?: boolean,
  ): FileSystemWatcher;
}

export type MsgFunc = <T extends MessageOptions | string | MessageItem>(
  message: string,
  ...items: T[]
) => Thenable<T>;

export const ILibroWindow = Symbol('ILibroWindow');
export interface ILibroWindow {
  tabGroups: TabGroups;
  activeTextEditor: TextEditor | undefined;
  onDidChangeActiveTextEditor: Event<TextEditor | undefined>;
  createOutputChannel: (
    name: string,
    options?: string | { log: true },
  ) => OutputChannel;
  showErrorMessage: MsgFunc;
  showWarningMessage: MsgFunc;
  showInformationMessage: MsgFunc;
  showTextDocument(
    documentOrUri: TextDocument | Uri,
    columnOrOptions?: ViewColumn | TextDocumentShowOptions,
    preserveFocus?: boolean,
  ): Promise<TextEditor>;
  withProgress<R>(
    options: ProgressOptions,
    task: (
      progress: Progress<{ message?: string; worked?: number }>,
      token: CancellationToken,
    ) => Thenable<R>,
  ): void;
}

export const IMonacoLanguages = Symbol('IMonacoLanguages');
export interface IMonacoLanguages {
  createDiagnosticCollection(name?: string): DiagnosticCollection;
  match(selector: DocumentSelector, document: TextDocument): number;

  registerCodeActionsProvider(
    selector: DocumentSelector,
    provider: CodeActionProvider,
    metadata?: CodeActionProviderMetadata,
  ): Disposable;
  registerCodeLensProvider(
    selector: DocumentSelector,
    provider: CodeLensProvider,
  ): Disposable;
  registerDefinitionProvider(
    selector: DocumentSelector,
    provider: DefinitionProvider,
  ): Disposable;
  registerDeclarationProvider(
    selector: DocumentSelector,
    provider: DeclarationProvider,
  ): Disposable;
  registerImplementationProvider(
    selector: DocumentSelector,
    provider: ImplementationProvider,
  ): Disposable;
  registerTypeDefinitionProvider(
    selector: DocumentSelector,
    provider: TypeDefinitionProvider,
  ): Disposable;
  registerHoverProvider(
    selector: DocumentSelector,
    provider: HoverProvider,
  ): Disposable;
  registerInlineValuesProvider(
    selector: DocumentSelector,
    provider: InlineValuesProvider,
  ): Disposable;
  registerDocumentHighlightProvider(
    selector: DocumentSelector,
    provider: DocumentHighlightProvider,
  ): Disposable;
  registerLinkedEditingRangeProvider(
    selector: DocumentSelector,
    provider: LinkedEditingRangeProvider,
  ): Disposable;
  registerReferenceProvider(
    selector: DocumentSelector,
    provider: ReferenceProvider,
  ): Disposable;
  registerRenameProvider(
    selector: DocumentSelector,
    provider: RenameProvider,
  ): Disposable;
  registerDocumentSymbolProvider(
    selector: DocumentSelector,
    provider: DocumentSymbolProvider,
    metadata?: DocumentSymbolProviderMetadata,
  ): Disposable;
  registerWorkspaceSymbolProvider(provider: WorkspaceSymbolProvider): Disposable;
  registerDocumentFormattingEditProvider(
    selector: DocumentSelector,
    provider: DocumentFormattingEditProvider,
  ): Disposable;
  registerDocumentRangeFormattingEditProvider(
    selector: DocumentSelector,
    provider: DocumentRangeFormattingEditProvider,
  ): Disposable;
  registerOnTypeFormattingEditProvider(
    selector: DocumentSelector,
    provider: OnTypeFormattingEditProvider,
    firstTriggerCharacter: string,
    ...moreTriggerCharacters: string[]
  ): Disposable;
  registerDocumentSemanticTokensProvider(
    selector: DocumentSelector,
    provider: DocumentSemanticTokensProvider,
    legend: SemanticTokensLegend,
  ): Disposable;
  registerDocumentRangeSemanticTokensProvider(
    selector: DocumentSelector,
    provider: DocumentRangeSemanticTokensProvider,
    legend: SemanticTokensLegend,
  ): Disposable;
  registerSignatureHelpProvider(
    selector: DocumentSelector,
    provider: SignatureHelpProvider,
    firstItem?: string | SignatureHelpProviderMetadata,
    ...remaining: string[]
  ): Disposable;
  registerCompletionItemProvider(
    selector: DocumentSelector,
    provider: CompletionItemProvider,
    ...triggerCharacters: string[]
  ): Disposable;
  registerInlineCompletionItemProvider(
    selector: DocumentSelector,
    provider: InlineCompletionItemProvider,
    // metadata?: InlineCompletionItemProviderMetadata,
  ): Disposable;
  registerDocumentLinkProvider(
    selector: DocumentSelector,
    provider: DocumentLinkProvider,
  ): Disposable;
  registerColorProvider(
    selector: DocumentSelector,
    provider: DocumentColorProvider,
  ): Disposable;
  registerFoldingRangeProvider(
    selector: DocumentSelector,
    provider: FoldingRangeProvider,
  ): Disposable;
  registerSelectionRangeProvider(
    selector: DocumentSelector,
    provider: SelectionRangeProvider,
  ): Disposable;
  registerCallHierarchyProvider(
    selector: DocumentSelector,
    provider: CallHierarchyProvider,
  ): Disposable;
  registerTypeHierarchyProvider(
    selector: DocumentSelector,
    provider: TypeHierarchyProvider,
  ): Disposable;
  setLanguageConfiguration(
    language: string,
    configuration: LanguageConfiguration,
  ): Disposable;
  registerInlayHintsProvider(
    selector: DocumentSelector,
    provider: InlayHintsProvider,
  ): Disposable;
}
