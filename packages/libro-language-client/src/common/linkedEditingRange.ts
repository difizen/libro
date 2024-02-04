/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as proto from '@difizen/vscode-languageserver-protocol';
import type {
  CancellationToken,
  LinkedEditingRangeProvider,
  LinkedEditingRanges,
  Position,
  ProviderResult,
  TextDocument,
  Disposable,
} from 'vscode';

import type { FeatureClient } from './features.js';
import { TextDocumentLanguageFeature, ensure } from './features.js';
import { languages } from './vscodeAdaptor/vscodeAdaptor.js';

export interface ProvideLinkedEditingRangeSignature {
  (
    this: void,
    document: TextDocument,
    position: Position,
    token: CancellationToken,
  ): ProviderResult<LinkedEditingRanges>;
}

/**
 * Linked editing middleware
 *
 * @since 3.16.0
 */
export interface LinkedEditingRangeMiddleware {
  provideLinkedEditingRange?: (
    this: void,
    document: TextDocument,
    position: Position,
    token: CancellationToken,
    next: ProvideLinkedEditingRangeSignature,
  ) => ProviderResult<LinkedEditingRanges>;
}

export class LinkedEditingFeature extends TextDocumentLanguageFeature<
  boolean | proto.LinkedEditingRangeOptions,
  proto.LinkedEditingRangeRegistrationOptions,
  LinkedEditingRangeProvider,
  LinkedEditingRangeMiddleware
> {
  constructor(client: FeatureClient<LinkedEditingRangeMiddleware>) {
    super(client, proto.LinkedEditingRangeRequest.type);
  }

  public fillClientCapabilities(capabilities: proto.ClientCapabilities): void {
    const linkedEditingSupport = ensure(
      ensure(capabilities, 'textDocument')!,
      'linkedEditingRange',
    )!;
    linkedEditingSupport.dynamicRegistration = true;
  }

  public initialize(
    capabilities: proto.ServerCapabilities,
    documentSelector: proto.DocumentSelector,
  ): void {
    const [id, options] = this.getRegistration(
      documentSelector,
      capabilities.linkedEditingRangeProvider,
    );
    if (!id || !options) {
      return;
    }
    this.register({ id: id, registerOptions: options });
  }

  protected registerLanguageProvider(
    options: proto.LinkedEditingRangeRegistrationOptions,
  ): [Disposable, LinkedEditingRangeProvider] {
    const selector = options.documentSelector!;
    const provider: LinkedEditingRangeProvider = {
      provideLinkedEditingRanges: (document, position, token) => {
        const client = this._client;
        const provideLinkedEditing: ProvideLinkedEditingRangeSignature = (
          document,
          position,
          token,
        ) => {
          return client
            .sendRequest(
              proto.LinkedEditingRangeRequest.type,
              client.code2ProtocolConverter.asTextDocumentPositionParams(
                document,
                position,
              ),
              token,
            )
            .then(
              (result) => {
                if (token.isCancellationRequested) {
                  return null;
                }
                return client.protocol2CodeConverter.asLinkedEditingRanges(
                  result,
                  token,
                );
              },
              (error) => {
                return client.handleFailedRequest(
                  proto.LinkedEditingRangeRequest.type,
                  token,
                  error,
                  null,
                );
              },
            );
        };
        const middleware = client.middleware;
        return middleware.provideLinkedEditingRange
          ? middleware.provideLinkedEditingRange(
              document,
              position,
              token,
              provideLinkedEditing,
            )
          : provideLinkedEditing(document, position, token);
      },
    };
    return [this.registerProvider(selector, provider), provider];
  }

  private registerProvider(
    selector: proto.DocumentSelector,
    provider: LinkedEditingRangeProvider,
  ): Disposable {
    return languages.registerLinkedEditingRangeProvider(
      this._client.protocol2CodeConverter.asDocumentSelector(selector),
      provider,
    );
  }
}
