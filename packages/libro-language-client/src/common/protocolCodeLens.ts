/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import type { Range } from './vscodeAdaptor/vscodeAdaptor.js';
import { CodeLens } from './vscodeAdaptor/vscodeAdaptor.js';

export default class ProtocolCodeLens extends CodeLens {
  public data: any;

  constructor(range: Range) {
    super(range);
  }
}
