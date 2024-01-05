/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import type { InlayHintKind } from 'vscode';

import type { InlayHintLabelPart, Position } from './vscodeAdaptor/vscodeAdaptor.js';
import { InlayHint } from './vscodeAdaptor/vscodeAdaptor.js';

export default class ProtocolInlayHint extends InlayHint {
  public data: any;

  constructor(
    position: Position,
    label: string | InlayHintLabelPart[],
    kind?: InlayHintKind,
  ) {
    super(position, label, kind);
  }
}
