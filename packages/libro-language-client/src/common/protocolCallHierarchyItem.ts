/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import type { LSPAny } from '@difizen/vscode-languageserver-protocol';
import type { SymbolKind, Uri } from 'vscode';

import type { Range } from './vscodeAdaptor/vscodeAdaptor.js';
import { CallHierarchyItem } from './vscodeAdaptor/vscodeAdaptor.js';

export default class ProtocolCallHierarchyItem extends CallHierarchyItem {
  public data?: LSPAny;

  constructor(
    kind: SymbolKind,
    name: string,
    detail: string,
    uri: Uri,
    range: Range,
    selectionRange: Range,
    data?: LSPAny,
  ) {
    super(kind, name, detail, uri, range, selectionRange);
    if (data !== undefined) {
      this.data = data;
    }
  }
}
