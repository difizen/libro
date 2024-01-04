import { Emitter as EventEmitter } from '@difizen/mana-common';
import * as monaco from '@difizen/monaco-editor-core';
import type {
  OutputChannel,
  DiagnosticCollection,
  MessageItem,
  TextDocument,
  ViewColumn,
  TextDocumentShowOptions,
  TextEditor,
  WorkspaceFolder,
  ConfigurationChangeEvent,
  Event,
  WorkspaceConfiguration,
  ConfigurationScope,
  WorkspaceEdit,
  WorkspaceEditMetadata,
  NotebookDocument,
  MessageOptions,
  TextDocumentChangeEvent,
  NotebookDocumentChangeEvent,
  DocumentSelector,
  FileSystem,
  FileCreateEvent,
  FileRenameEvent,
  FileWillRenameEvent,
  FileDeleteEvent,
  FileWillDeleteEvent,
  FileWillCreateEvent,
  Disposable,
  FileSystemWatcher,
  GlobPattern,
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
  EvaluatableExpressionProvider,
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
  WorkspaceFoldersChangeEvent,
  ProgressOptions,
  Progress,
  CancellationToken,
  TextDocumentWillSaveEvent,
  TabGroups,
} from 'vscode';

export const CompletionItemTag = monaco.languages.CompletionItemTag;
export type CompletionItemTag = monaco.languages.CompletionItemTag;
export const SignatureHelpTriggerKind = monaco.languages.SignatureHelpTriggerKind;
export type SignatureHelpTriggerKind = monaco.languages.SignatureHelpTriggerKind;
export const CompletionTriggerKind = monaco.languages.CompletionTriggerKind;
export type CompletionTriggerKind = monaco.languages.CompletionTriggerKind;

class VscodeWorkspace {
  workspaceFolders: WorkspaceFolder[] | undefined = [];
  getWorkspaceFolder(uri: Uri): WorkspaceFolder | undefined {
    return;
  }
  notebookDocuments: NotebookDocument[] = [];
  textDocuments: TextDocument[] = [];
  fs: FileSystem;
  onDidChangeWorkspaceFolders: Event<WorkspaceFoldersChangeEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onDidChangeConfiguration: Event<ConfigurationChangeEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  getConfiguration(
    section?: string | undefined,
    scope?: ConfigurationScope | null | undefined,
  ): WorkspaceConfiguration {
    return {} as WorkspaceConfiguration;
  }
  applyEdit(edit: WorkspaceEdit, metadata?: WorkspaceEditMetadata): Thenable<boolean> {
    return Promise.resolve(true);
  }
  onDidOpenNotebookDocument: Event<NotebookDocument> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onDidSaveNotebookDocument: Event<NotebookDocument> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onDidCloseNotebookDocument: Event<NotebookDocument> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onDidChangeNotebookDocument: Event<NotebookDocumentChangeEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };

  onDidOpenTextDocument: Event<TextDocument> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onDidSaveTextDocument: Event<TextDocument> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onWillSaveTextDocument: Event<TextDocumentWillSaveEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onDidCloseTextDocument: Event<TextDocument> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onDidChangeTextDocument: Event<TextDocumentChangeEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onDidCreateFiles: Event<FileCreateEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onDidRenameFiles: Event<FileRenameEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onWillRenameFiles: Event<FileWillRenameEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onDidDeleteFiles: Event<FileDeleteEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onWillDeleteFiles: Event<FileWillDeleteEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  onWillCreateFiles: Event<FileWillCreateEvent> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  createFileSystemWatcher(
    pattern: GlobPattern,
    optionsOrIgnoreCreate: any,
    ignoreChange?: boolean,
    ignoreDelete?: boolean,
  ): FileSystemWatcher {
    return {} as FileSystemWatcher;
  }
}

export const workspace = new VscodeWorkspace();

type MsgFunc = <T extends MessageOptions | string | MessageItem>(
  message: string,
  ...items: T[]
) => Thenable<T>;

class VscodeWindow {
  tabGroups: TabGroups;
  activeTextEditor: TextEditor | undefined;
  onDidChangeActiveTextEditor: Event<TextEditor | undefined> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  createOutputChannel(name: string, options?: string | { log: true }): OutputChannel {
    return {} as OutputChannel;
  }
  showErrorMessage: MsgFunc = (message: string, ...items) => {
    return Promise.resolve(items[0]);
  };
  showWarningMessage: MsgFunc = (message: string, ...items) => {
    return Promise.resolve(items[0]);
  };
  showInformationMessage: MsgFunc = (message: string, ...items) => {
    return Promise.resolve(items[0]);
  };
  showTextDocument(
    documentOrUri: TextDocument | Uri,
    columnOrOptions?: ViewColumn | TextDocumentShowOptions,
    preserveFocus?: boolean,
  ): Promise<TextEditor> {
    return Promise.resolve({} as TextEditor);
  }
  withProgress<R>(
    options: ProgressOptions,
    task: (
      progress: Progress<{ message?: string; worked?: number }>,
      token: CancellationToken,
    ) => Thenable<R>,
  ) {
    return Promise.resolve({} as R);
  }
}

export const window = new VscodeWindow();

export class Uri extends monaco.Uri {}

class VscodeLanguages {
  createDiagnosticCollection(name?: string): DiagnosticCollection {
    return {} as DiagnosticCollection;
  }
  match(selector: DocumentSelector, document: TextDocument): number {
    // const notebook = extHostDocuments.getDocumentData(document.uri)?.notebook;
    // return score(typeConverters.LanguageSelector.from(selector), document.uri, document.languageId, true, notebook?.uri, notebook?.notebookType);
    return 0;
  }

  registerCodeActionsProvider(
    selector: DocumentSelector,
    provider: CodeActionProvider,
    metadata?: CodeActionProviderMetadata,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerDocumentPasteEditProvider(
    selector: DocumentSelector,
    provider: DocumentPasteEditProvider,
    metadata: DocumentPasteProviderMetadata,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerCodeLensProvider(
    selector: DocumentSelector,
    provider: CodeLensProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerDefinitionProvider(
    selector: DocumentSelector,
    provider: DefinitionProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerDeclarationProvider(
    selector: DocumentSelector,
    provider: DeclarationProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerImplementationProvider(
    selector: DocumentSelector,
    provider: ImplementationProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerTypeDefinitionProvider(
    selector: DocumentSelector,
    provider: TypeDefinitionProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerHoverProvider(
    selector: DocumentSelector,
    provider: HoverProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerEvaluatableExpressionProvider(
    selector: DocumentSelector,
    provider: EvaluatableExpressionProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerInlineValuesProvider(
    selector: DocumentSelector,
    provider: InlineValuesProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerDocumentHighlightProvider(
    selector: DocumentSelector,
    provider: DocumentHighlightProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerMultiDocumentHighlightProvider(
    selector: DocumentSelector,
    provider: MultiDocumentHighlightProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerLinkedEditingRangeProvider(
    selector: DocumentSelector,
    provider: LinkedEditingRangeProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerReferenceProvider(
    selector: DocumentSelector,
    provider: ReferenceProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerRenameProvider(
    selector: DocumentSelector,
    provider: RenameProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerDocumentSymbolProvider(
    selector: DocumentSelector,
    provider: DocumentSymbolProvider,
    metadata?: DocumentSymbolProviderMetadata,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerWorkspaceSymbolProvider(provider: WorkspaceSymbolProvider): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerDocumentFormattingEditProvider(
    selector: DocumentSelector,
    provider: DocumentFormattingEditProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerDocumentRangeFormattingEditProvider(
    selector: DocumentSelector,
    provider: DocumentRangeFormattingEditProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerOnTypeFormattingEditProvider(
    selector: DocumentSelector,
    provider: OnTypeFormattingEditProvider,
    firstTriggerCharacter: string,
    ...moreTriggerCharacters: string[]
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerDocumentSemanticTokensProvider(
    selector: DocumentSelector,
    provider: DocumentSemanticTokensProvider,
    legend: SemanticTokensLegend,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerDocumentRangeSemanticTokensProvider(
    selector: DocumentSelector,
    provider: DocumentRangeSemanticTokensProvider,
    legend: SemanticTokensLegend,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerSignatureHelpProvider(
    selector: DocumentSelector,
    provider: SignatureHelpProvider,
    firstItem?: string | SignatureHelpProviderMetadata,
    ...remaining: string[]
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerCompletionItemProvider(
    selector: DocumentSelector,
    provider: CompletionItemProvider,
    ...triggerCharacters: string[]
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerInlineCompletionItemProvider(
    selector: DocumentSelector,
    provider: InlineCompletionItemProvider,
    metadata?: InlineCompletionItemProviderMetadata,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerDocumentLinkProvider(
    selector: DocumentSelector,
    provider: DocumentLinkProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerColorProvider(
    selector: DocumentSelector,
    provider: DocumentColorProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerFoldingRangeProvider(
    selector: DocumentSelector,
    provider: FoldingRangeProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerSelectionRangeProvider(
    selector: DocumentSelector,
    provider: SelectionRangeProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerCallHierarchyProvider(
    selector: DocumentSelector,
    provider: CallHierarchyProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerTypeHierarchyProvider(
    selector: DocumentSelector,
    provider: TypeHierarchyProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  setLanguageConfiguration(
    language: string,
    configuration: LanguageConfiguration,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
  registerInlayHintsProvider(
    selector: DocumentSelector,
    provider: InlayHintsProvider,
  ): Disposable {
    return {
      dispose: () => {
        return;
      },
    };
  }
}

export const languages = new VscodeLanguages();

export const version = '1.85.1';

class VscodeEnv {
  language = 'python';
  appName = 'libro';
  openExternal(target: Uri): Thenable<boolean> {
    return Promise.resolve(true);
  }
}

export const env = new VscodeEnv();

export class CancellationTokenSource extends monaco.CancellationTokenSource {}

const canceledName = 'Canceled';
export class CancellationError extends Error {
  constructor() {
    super(canceledName);
    this.name = this.message;
  }
}

class Commands {
  registerCommand(
    command: string,
    callback: (...args: any[]) => any,
    thisArg?: any,
  ): Disposable {
    return {
      dispose() {
        return;
      },
    };
  }
}

export const commands = new Commands();

export { EventEmitter };

export * from './extHostTypes.js';
