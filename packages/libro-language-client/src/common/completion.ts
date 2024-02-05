/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import type {
  ClientCapabilities,
  CompletionOptions,
  CompletionRegistrationOptions,
  DocumentSelector,
  ServerCapabilities,
} from '@difizen/vscode-languageserver-protocol';
import {
  CompletionItemKind,
  CompletionItemTag,
  CompletionRequest,
  CompletionResolveRequest,
  InsertTextMode,
  MarkupKind,
} from '@difizen/vscode-languageserver-protocol';
import type {
  TextDocument,
  Disposable,
  Position as VPosition,
  CompletionContext as VCompletionContext,
  CancellationToken,
  ProviderResult,
  CompletionItem as VCompletionItem,
  CompletionList as VCompletionList,
  CompletionItemProvider,
} from 'vscode';

import type { FeatureClient } from './features.js';
import { ensure, TextDocumentLanguageFeature } from './features.js';
import * as UUID from './utils/uuid.js';
import { languages as Languages } from './vscodeAdaptor/vscodeAdaptor.js';

const SupportedCompletionItemKinds: CompletionItemKind[] = [
  CompletionItemKind.Text,
  CompletionItemKind.Method,
  CompletionItemKind.Function,
  CompletionItemKind.Constructor,
  CompletionItemKind.Field,
  CompletionItemKind.Variable,
  CompletionItemKind.Class,
  CompletionItemKind.Interface,
  CompletionItemKind.Module,
  CompletionItemKind.Property,
  CompletionItemKind.Unit,
  CompletionItemKind.Value,
  CompletionItemKind.Enum,
  CompletionItemKind.Keyword,
  CompletionItemKind.Snippet,
  CompletionItemKind.Color,
  CompletionItemKind.File,
  CompletionItemKind.Reference,
  CompletionItemKind.Folder,
  CompletionItemKind.EnumMember,
  CompletionItemKind.Constant,
  CompletionItemKind.Struct,
  CompletionItemKind.Event,
  CompletionItemKind.Operator,
  CompletionItemKind.TypeParameter,
];

export interface ProvideCompletionItemsSignature {
  (
    this: void,
    document: TextDocument,
    position: VPosition,
    context: VCompletionContext,
    token: CancellationToken,
  ): ProviderResult<VCompletionItem[] | VCompletionList>;
}

export interface ResolveCompletionItemSignature {
  (
    this: void,
    item: VCompletionItem,
    token: CancellationToken,
  ): ProviderResult<VCompletionItem>;
}

export interface CompletionMiddleware {
  provideCompletionItem?: (
    this: void,
    document: TextDocument,
    position: VPosition,
    context: VCompletionContext,
    token: CancellationToken,
    next: ProvideCompletionItemsSignature,
  ) => ProviderResult<VCompletionItem[] | VCompletionList>;
  resolveCompletionItem?: (
    this: void,
    item: VCompletionItem,
    token: CancellationToken,
    next: ResolveCompletionItemSignature,
  ) => ProviderResult<VCompletionItem>;
}

export class CompletionItemFeature extends TextDocumentLanguageFeature<
  CompletionOptions,
  CompletionRegistrationOptions,
  CompletionItemProvider,
  CompletionMiddleware
> {
  private labelDetailsSupport: Map<string, boolean>;

  constructor(client: FeatureClient<CompletionMiddleware>) {
    super(client, CompletionRequest.type);
    this.labelDetailsSupport = new Map();
  }

  public fillClientCapabilities(capabilities: ClientCapabilities): void {
    const completion = ensure(ensure(capabilities, 'textDocument')!, 'completion')!;
    completion.dynamicRegistration = true;
    completion.contextSupport = true;
    completion.completionItem = {
      snippetSupport: true,
      commitCharactersSupport: true,
      documentationFormat: [MarkupKind.Markdown, MarkupKind.PlainText],
      deprecatedSupport: true,
      preselectSupport: true,
      tagSupport: { valueSet: [CompletionItemTag.Deprecated] },
      insertReplaceSupport: true,
      resolveSupport: {
        properties: ['documentation', 'detail', 'additionalTextEdits'],
      },
      insertTextModeSupport: {
        valueSet: [InsertTextMode.asIs, InsertTextMode.adjustIndentation],
      },
      labelDetailsSupport: true,
    };
    completion.insertTextMode = InsertTextMode.adjustIndentation;
    completion.completionItemKind = { valueSet: SupportedCompletionItemKinds };
    completion.completionList = {
      itemDefaults: [
        'commitCharacters',
        'editRange',
        'insertTextFormat',
        'insertTextMode',
        'data',
      ],
    };
  }

  public initialize(
    capabilities: ServerCapabilities,
    documentSelector: DocumentSelector,
  ): void {
    const options = this.getRegistrationOptions(
      documentSelector,
      capabilities.completionProvider,
    );
    if (!options) {
      return;
    }

    this.register({
      id: UUID.generateUuid(),
      registerOptions: options,
    });
  }

  protected registerLanguageProvider(
    options: CompletionRegistrationOptions,
    id: string,
  ): [Disposable, CompletionItemProvider] {
    this.labelDetailsSupport.set(id, !!options.completionItem?.labelDetailsSupport);
    const triggerCharacters = options.triggerCharacters ?? [];
    const defaultCommitCharacters = options.allCommitCharacters;
    const selector = options.documentSelector!;
    const provider: CompletionItemProvider = {
      provideCompletionItems: (
        document: TextDocument,
        position: VPosition,
        token: CancellationToken,
        context: VCompletionContext,
      ): ProviderResult<VCompletionList | VCompletionItem[]> => {
        const client = this._client;
        const middleware = this._client.middleware;
        const provideCompletionItems: ProvideCompletionItemsSignature = (
          document,
          position,
          context,
          token,
        ) => {
          return client
            .sendRequest(
              CompletionRequest.type,
              client.code2ProtocolConverter.asCompletionParams(
                document,
                position,
                context,
              ),
              token,
            )
            .then(
              (result) => {
                if (token.isCancellationRequested) {
                  return null;
                }
                return client.protocol2CodeConverter.asCompletionResult(
                  result,
                  defaultCommitCharacters,
                  token,
                );
              },
              (error) => {
                return client.handleFailedRequest(
                  CompletionRequest.type,
                  token,
                  error,
                  null,
                );
              },
            );
        };
        return middleware.provideCompletionItem
          ? middleware.provideCompletionItem(
              document,
              position,
              context,
              token,
              provideCompletionItems,
            )
          : provideCompletionItems(document, position, context, token);
      },
      resolveCompletionItem: options.resolveProvider
        ? (
            item: VCompletionItem,
            token: CancellationToken,
          ): ProviderResult<VCompletionItem> => {
            const client = this._client;
            const middleware = this._client.middleware;
            const resolveCompletionItem: ResolveCompletionItemSignature = (
              item,
              token,
            ) => {
              return client
                .sendRequest(
                  CompletionResolveRequest.type,
                  client.code2ProtocolConverter.asCompletionItem(
                    item,
                    !!this.labelDetailsSupport.get(id),
                  ),
                  token,
                )
                .then(
                  (result) => {
                    if (token.isCancellationRequested) {
                      return null;
                    }
                    return client.protocol2CodeConverter.asCompletionItem(result);
                  },
                  (error) => {
                    return client.handleFailedRequest(
                      CompletionResolveRequest.type,
                      token,
                      error,
                      item,
                    );
                  },
                );
            };
            return middleware.resolveCompletionItem
              ? middleware.resolveCompletionItem(item, token, resolveCompletionItem)
              : resolveCompletionItem(item, token);
          }
        : undefined,
    };
    return [
      Languages.registerCompletionItemProvider(
        this._client.protocol2CodeConverter.asDocumentSelector(selector),
        provider,
        ...triggerCharacters,
      ),
      provider,
    ];
  }
}
