/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as monaco from 'vscode';
import type { LSPAny } from 'vscode-languageserver-protocol';

export default class ProtocolCodeAction extends monaco.CodeAction {
  public readonly data: LSPAny | undefined;

  constructor(title: string, data: LSPAny | undefined) {
    super(title);
    this.data = data;
  }
}
