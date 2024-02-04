/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import type * as proto from '@difizen/vscode-languageserver-protocol';

import type { CompletionItemLabel } from './vscodeAdaptor/vscodeAdaptor.js';
import { CompletionItem } from './vscodeAdaptor/vscodeAdaptor.js';

export default class ProtocolCompletionItem extends CompletionItem {
  public data: any;
  public fromEdit: boolean | undefined;
  public documentationFormat: string | undefined;
  public originalItemKind: proto.CompletionItemKind | undefined;
  public deprecated: boolean | undefined;
  public insertTextMode: proto.InsertTextMode | undefined;

  constructor(label: string | CompletionItemLabel) {
    super(label);
  }
}
