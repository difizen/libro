/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import type { Uri } from 'vscode';

import type { Range } from './vscodeAdaptor/vscodeAdaptor.js';
import { DocumentLink } from './vscodeAdaptor/vscodeAdaptor.js';

export default class ProtocolDocumentLink extends DocumentLink {
  public data: any;

  constructor(range: Range, target?: Uri | undefined) {
    super(range, target);
  }
}
