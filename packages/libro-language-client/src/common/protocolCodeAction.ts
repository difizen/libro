/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import type { LSPAny } from '@difizen/vscode-languageserver-protocol';

import { CodeAction } from './vscodeAdaptor/vscodeAdaptor.js';

export default class ProtocolCodeAction extends CodeAction {
  public readonly data: LSPAny | undefined;

  constructor(title: string, data: LSPAny | undefined) {
    super(title);
    this.data = data;
  }
}
