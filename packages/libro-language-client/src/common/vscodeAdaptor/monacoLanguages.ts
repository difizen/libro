import { singleton } from '@difizen/mana-app';
import * as monaco from '@difizen/monaco-editor-core';
// import { score } from '@difizen/monaco-editor-core/esm/vs/editor/common/languageSelector.js';
import type {
  DiagnosticCollection,
  TextDocument,
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
  CompletionItem,
} from 'vscode';

import * as c2p from '../codeConverter.js';
import * as p2c from '../protocolConverter.js';

import { LibroDiagnosticCollection } from './diagnosticCollection.js';
import {
  MonacoToProtocolConverter,
  ProtocolToMonacoConverter,
} from './monaco-converter.js';
import { IMonacoLanguages } from './services.js';
import { CompletionTriggerKind } from './vscodeAdaptor.js';

function overrideWithResolvedValue<T>(item: T, resolvedItem: T): void {
  for (const key in resolvedItem) {
    const value = resolvedItem[key];
    // eslint-disable-next-line eqeqeq
    if (value != null) {
      item[key] = value;
    }
  }
}

@singleton({ token: IMonacoLanguages })
export class MonacoLanguages implements IMonacoLanguages {
  protected readonly c2p: c2p.Converter = c2p.createConverter();
  protected readonly p2c: p2c.Converter = p2c.createConverter(undefined, true, true);
  protected readonly p2m: ProtocolToMonacoConverter = new ProtocolToMonacoConverter(
    monaco,
  );
  protected readonly m2p: MonacoToProtocolConverter = new MonacoToProtocolConverter(
    monaco,
  );
  createDiagnosticCollection(name?: string): DiagnosticCollection {
    return new LibroDiagnosticCollection();
  }
  match(selector: DocumentSelector, document: TextDocument): number {
    // const notebook = extHostDocuments.getDocumentData(document.uri)?.notebook;
    // return score(
    //   typeConverters.LanguageSelector.from(selector),
    //   document.uri,
    //   document.languageId,
    //   true,
    //   notebook?.uri,
    //   notebook?.notebookType,
    // );
    return 1;
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
    return monaco.languages.registerDefinitionProvider(
      selector,
      this.createDefinitionProvider(provider),
    );
  }
  protected createDefinitionProvider(
    provider: DefinitionProvider,
  ): monaco.languages.DefinitionProvider {
    return {
      provideDefinition: async (model, position, token) => {
        const params = this.m2p.asTextDocumentPositionParams(model, position);
        const result = await provider.provideDefinition(
          { uri: model.uri } as any,
          this.p2c.asPosition(params.position),
          token,
        );
        return (
          result && this.p2m.asDefinitionResult(this.c2p.asDefinitionResult(result))
        );
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
    return monaco.languages.registerHoverProvider(
      selector,
      this.createHoverProvider(provider),
    );
  }

  protected createHoverProvider(
    provider: HoverProvider,
  ): monaco.languages.HoverProvider {
    return {
      provideHover: async (model, position, token) => {
        const params = this.m2p.asTextDocumentPositionParams(model, position);

        const hover = await provider.provideHover(
          { uri: model.uri } as any,
          this.p2c.asPosition(params.position),
          token,
        );

        if (!hover || !hover.range) {
          return;
        }
        return {
          contents: hover?.contents,
          range: this.p2m.asRange(this.c2p.asRange(hover.range)),
        } as monaco.languages.Hover;
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
    const documentFormattingEditProvider =
      this.createDocumentFormattingEditProvider(provider);
    return monaco.languages.registerDocumentFormattingEditProvider(
      selector,
      documentFormattingEditProvider,
    );
  }

  protected createDocumentFormattingEditProvider(
    provider: DocumentFormattingEditProvider,
  ): monaco.languages.DocumentFormattingEditProvider {
    return {
      provideDocumentFormattingEdits: async (model, options, token) => {
        const params = this.m2p.asDocumentFormattingParams(model, options);
        const result = await provider.provideDocumentFormattingEdits(
          { uri: model.uri } as any,
          params.options as any,
          token,
        );

        return result && this.p2m.asTextEdits(result);
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
    const completionProvider = this.createCompletionProvider(
      provider,
      ...triggerCharacters,
    );
    return monaco.languages.registerCompletionItemProvider(
      selector,
      completionProvider,
    );
  }

  protected createCompletionProvider(
    provider: CompletionItemProvider,
    ...triggerCharacters: string[]
  ): monaco.languages.CompletionItemProvider {
    return {
      triggerCharacters,
      provideCompletionItems: async (model, position, context, token) => {
        const wordUntil = model.getWordUntilPosition(position);
        const defaultRange = new monaco.Range(
          position.lineNumber,
          wordUntil.startColumn,
          position.lineNumber,
          wordUntil.endColumn,
        );
        const params = this.m2p.asCompletionParams(model, position, context);
        const result = await provider?.provideCompletionItems(
          this.p2c.asTextDcouemnt(params.textDocument),
          this.p2c.asPosition(params.position),
          token,
          {
            triggerCharacter: params.context?.triggerCharacter ?? '.',
            triggerKind:
              params.context?.triggerKind ?? CompletionTriggerKind.TriggerCharacter,
          },
        );

        if (!result) {
          return;
        }

        let items: CompletionItem[];
        if (Array.isArray(result)) {
          items = result;
        } else {
          items = result.items;
        }
        const res = items.map((item) =>
          this.p2m.asCompletionItem(this.c2p.asCompletionItem(item), defaultRange),
        );

        return { suggestions: res };
      },
      resolveCompletionItem: provider.resolveCompletionItem
        ? async (item, token) => {
            const protocolItem = this.m2p.asCompletionItem(item);
            const codeItem = this.p2c.asCompletionItem(protocolItem);
            const resolvedItem = await provider.resolveCompletionItem?.(
              codeItem,
              token,
            );
            if (resolvedItem) {
              const proItem = this.c2p.asCompletionItem(resolvedItem);
              const resolvedCompletionItem = this.p2m.asCompletionItem(
                proItem,
                item.range,
              );
              overrideWithResolvedValue(item, resolvedCompletionItem);
            }
            return item;
          }
        : undefined,
    };
  }

  registerInlineCompletionItemProvider(
    selector: DocumentSelector,
    provider: InlineCompletionItemProvider,
    // metadata?: InlineCompletionItemProviderMetadata,
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
