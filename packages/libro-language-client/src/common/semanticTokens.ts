/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import type {
  ClientCapabilities,
  ServerCapabilities,
  DocumentSelector,
  SemanticTokensOptions,
  SemanticTokensRegistrationOptions,
  SemanticTokensParams,
  SemanticTokensDeltaParams,
  SemanticTokensRangeParams,
} from '@difizen/vscode-languageserver-protocol';
import {
  SemanticTokenTypes,
  SemanticTokenModifiers,
  SemanticTokens,
  TokenFormat,
  SemanticTokensRequest,
  SemanticTokensDeltaRequest,
  SemanticTokensRangeRequest,
  SemanticTokensRefreshRequest,
  SemanticTokensRegistrationType,
} from '@difizen/vscode-languageserver-protocol';
import type {
  SemanticTokens as VSemanticTokens,
  CancellationToken,
  DocumentRangeSemanticTokensProvider,
  DocumentSemanticTokensProvider,
  ProviderResult,
  SemanticTokensEdits,
  TextDocument,
  SemanticTokensLegend,
  Range,
} from 'vscode';

import type { FeatureClient } from './features.js';
import { TextDocumentLanguageFeature, ensure } from './features.js';
import * as Is from './utils/is.js';
import { languages, Disposable, EventEmitter } from './vscodeAdaptor/vscodeAdaptor.js';

export interface DocumentSemanticsTokensSignature {
  (
    this: void,
    document: TextDocument,
    token: CancellationToken,
  ): ProviderResult<VSemanticTokens>;
}

export interface DocumentSemanticsTokensEditsSignature {
  (
    this: void,
    document: TextDocument,
    previousResultId: string,
    token: CancellationToken,
  ): ProviderResult<SemanticTokensEdits | VSemanticTokens>;
}

export interface DocumentRangeSemanticTokensSignature {
  (
    this: void,
    document: TextDocument,
    range: Range,
    token: CancellationToken,
  ): ProviderResult<VSemanticTokens>;
}

/**
 * The semantic token middleware
 *
 * @since 3.16.0
 */
export interface SemanticTokensMiddleware {
  provideDocumentSemanticTokens?: (
    this: void,
    document: TextDocument,
    token: CancellationToken,
    next: DocumentSemanticsTokensSignature,
  ) => ProviderResult<VSemanticTokens>;
  provideDocumentSemanticTokensEdits?: (
    this: void,
    document: TextDocument,
    previousResultId: string,
    token: CancellationToken,
    next: DocumentSemanticsTokensEditsSignature,
  ) => ProviderResult<SemanticTokensEdits | VSemanticTokens>;
  provideDocumentRangeSemanticTokens?: (
    this: void,
    document: TextDocument,
    range: Range,
    token: CancellationToken,
    next: DocumentRangeSemanticTokensSignature,
  ) => ProviderResult<VSemanticTokens>;
}

export interface SemanticTokensProviderShape {
  range?: DocumentRangeSemanticTokensProvider;
  full?: DocumentSemanticTokensProvider;
  onDidChangeSemanticTokensEmitter: EventEmitter<void>;
}

export class SemanticTokensFeature extends TextDocumentLanguageFeature<
  boolean | SemanticTokensOptions,
  SemanticTokensRegistrationOptions,
  SemanticTokensProviderShape,
  SemanticTokensMiddleware
> {
  constructor(client: FeatureClient<SemanticTokensMiddleware>) {
    super(client, SemanticTokensRegistrationType.type);
  }

  public fillClientCapabilities(capabilities: ClientCapabilities): void {
    const capability = ensure(ensure(capabilities, 'textDocument')!, 'semanticTokens')!;
    capability.dynamicRegistration = true;
    capability.tokenTypes = [
      SemanticTokenTypes.namespace,
      SemanticTokenTypes.type,
      SemanticTokenTypes.class,
      SemanticTokenTypes.enum,
      SemanticTokenTypes.interface,
      SemanticTokenTypes.struct,
      SemanticTokenTypes.typeParameter,
      SemanticTokenTypes.parameter,
      SemanticTokenTypes.variable,
      SemanticTokenTypes.property,
      SemanticTokenTypes.enumMember,
      SemanticTokenTypes.event,
      SemanticTokenTypes.function,
      SemanticTokenTypes.method,
      SemanticTokenTypes.macro,
      SemanticTokenTypes.keyword,
      SemanticTokenTypes.modifier,
      SemanticTokenTypes.comment,
      SemanticTokenTypes.string,
      SemanticTokenTypes.number,
      SemanticTokenTypes.regexp,
      SemanticTokenTypes.operator,
      SemanticTokenTypes.decorator,
    ];
    capability.tokenModifiers = [
      SemanticTokenModifiers.declaration,
      SemanticTokenModifiers.definition,
      SemanticTokenModifiers.readonly,
      SemanticTokenModifiers.static,
      SemanticTokenModifiers.deprecated,
      SemanticTokenModifiers.abstract,
      SemanticTokenModifiers.async,
      SemanticTokenModifiers.modification,
      SemanticTokenModifiers.documentation,
      SemanticTokenModifiers.defaultLibrary,
    ];
    capability.formats = [TokenFormat.Relative];
    capability.requests = {
      range: true,
      full: {
        delta: true,
      },
    };
    capability.multilineTokenSupport = false;
    capability.overlappingTokenSupport = false;
    capability.serverCancelSupport = true;
    capability.augmentsSyntaxTokens = true;
    ensure(ensure(capabilities, 'workspace')!, 'semanticTokens')!.refreshSupport = true;
  }

  public initialize(
    capabilities: ServerCapabilities,
    documentSelector: DocumentSelector,
  ): void {
    const client = this._client;
    client.onRequest(SemanticTokensRefreshRequest.type, async () => {
      for (const provider of this.getAllProviders()) {
        provider.onDidChangeSemanticTokensEmitter.fire();
      }
    });
    const [id, options] = this.getRegistration(
      documentSelector,
      capabilities.semanticTokensProvider,
    );
    if (!id || !options) {
      return;
    }
    this.register({ id: id, registerOptions: options });
  }

  protected registerLanguageProvider(
    options: SemanticTokensRegistrationOptions,
  ): [Disposable, SemanticTokensProviderShape] {
    const selector = options.documentSelector!;
    const fullProvider = Is.boolean(options.full)
      ? options.full
      : options.full !== undefined;
    const hasEditProvider =
      options.full !== undefined &&
      typeof options.full !== 'boolean' &&
      options.full.delta === true;
    const eventEmitter: EventEmitter<void> = new EventEmitter<void>();
    const documentProvider: DocumentSemanticTokensProvider | undefined = fullProvider
      ? {
          onDidChangeSemanticTokens: eventEmitter.event,
          provideDocumentSemanticTokens: (document, token) => {
            const client = this._client;
            const middleware = client.middleware;
            const provideDocumentSemanticTokens: DocumentSemanticsTokensSignature = (
              document,
              token,
            ) => {
              const params: SemanticTokensParams = {
                textDocument:
                  client.code2ProtocolConverter.asTextDocumentIdentifier(document),
              };
              return client.sendRequest(SemanticTokensRequest.type, params, token).then(
                (result) => {
                  if (token.isCancellationRequested) {
                    return null;
                  }
                  return client.protocol2CodeConverter.asSemanticTokens(result, token);
                },
                (error: any) => {
                  return client.handleFailedRequest(
                    SemanticTokensRequest.type,
                    token,
                    error,
                    null,
                  );
                },
              );
            };
            return middleware.provideDocumentSemanticTokens
              ? middleware.provideDocumentSemanticTokens(
                  document,
                  token,
                  provideDocumentSemanticTokens,
                )
              : provideDocumentSemanticTokens(document, token);
          },
          provideDocumentSemanticTokensEdits: hasEditProvider
            ? (document, previousResultId, token) => {
                const client = this._client;
                const middleware = client.middleware;
                const provideDocumentSemanticTokensEdits: DocumentSemanticsTokensEditsSignature =
                  (document, previousResultId, token) => {
                    const params: SemanticTokensDeltaParams = {
                      textDocument:
                        client.code2ProtocolConverter.asTextDocumentIdentifier(
                          document,
                        ),
                      previousResultId,
                    };
                    return client
                      .sendRequest(SemanticTokensDeltaRequest.type, params, token)
                      .then(
                        async (result) => {
                          if (token.isCancellationRequested) {
                            return null;
                          }
                          if (SemanticTokens.is(result)) {
                            return await client.protocol2CodeConverter.asSemanticTokens(
                              result,
                              token,
                            );
                          } else {
                            return await client.protocol2CodeConverter.asSemanticTokensEdits(
                              result,
                              token,
                            );
                          }
                        },
                        (error: any) => {
                          return client.handleFailedRequest(
                            SemanticTokensDeltaRequest.type,
                            token,
                            error,
                            null,
                          );
                        },
                      );
                  };
                return middleware.provideDocumentSemanticTokensEdits
                  ? middleware.provideDocumentSemanticTokensEdits(
                      document,
                      previousResultId,
                      token,
                      provideDocumentSemanticTokensEdits,
                    )
                  : provideDocumentSemanticTokensEdits(
                      document,
                      previousResultId,
                      token,
                    );
              }
            : undefined,
        }
      : undefined;

    const hasRangeProvider: boolean = options.range === true;
    const rangeProvider: DocumentRangeSemanticTokensProvider | undefined =
      hasRangeProvider
        ? {
            provideDocumentRangeSemanticTokens: (
              document: TextDocument,
              range: Range,
              token: CancellationToken,
            ) => {
              const client = this._client;
              const middleware = client.middleware;
              const provideDocumentRangeSemanticTokens: DocumentRangeSemanticTokensSignature =
                (document, range, token) => {
                  const params: SemanticTokensRangeParams = {
                    textDocument:
                      client.code2ProtocolConverter.asTextDocumentIdentifier(document),
                    range: client.code2ProtocolConverter.asRange(range),
                  };
                  return client
                    .sendRequest(SemanticTokensRangeRequest.type, params, token)
                    .then(
                      (result) => {
                        if (token.isCancellationRequested) {
                          return null;
                        }
                        return client.protocol2CodeConverter.asSemanticTokens(
                          result,
                          token,
                        );
                      },
                      (error: any) => {
                        return client.handleFailedRequest(
                          SemanticTokensRangeRequest.type,
                          token,
                          error,
                          null,
                        );
                      },
                    );
                };
              return middleware.provideDocumentRangeSemanticTokens
                ? middleware.provideDocumentRangeSemanticTokens(
                    document,
                    range,
                    token,
                    provideDocumentRangeSemanticTokens,
                  )
                : provideDocumentRangeSemanticTokens(document, range, token);
            },
          }
        : undefined;

    const disposables: Disposable[] = [];
    const client = this._client;
    const legend: SemanticTokensLegend =
      client.protocol2CodeConverter.asSemanticTokensLegend(options.legend);
    const documentSelector = client.protocol2CodeConverter.asDocumentSelector(selector);
    if (documentProvider !== undefined) {
      disposables.push(
        languages.registerDocumentSemanticTokensProvider(
          documentSelector,
          documentProvider,
          legend,
        ),
      );
    }
    if (rangeProvider !== undefined) {
      disposables.push(
        languages.registerDocumentRangeSemanticTokensProvider(
          documentSelector,
          rangeProvider,
          legend,
        ),
      );
    }

    return [
      new Disposable(() => disposables.forEach((item) => item.dispose())),
      {
        range: rangeProvider,
        full: documentProvider,
        onDidChangeSemanticTokensEmitter: eventEmitter,
      },
    ];
  }
}
