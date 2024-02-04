/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import type { LSPAny } from '@difizen/vscode-languageserver-protocol';
import type { SymbolKind } from 'vscode';

import {
  SymbolInformation,
  Location,
  Range,
  Uri,
} from './vscodeAdaptor/vscodeAdaptor.js';

export default class WorkspaceSymbol extends SymbolInformation {
  public data?: LSPAny;
  public readonly hasRange: boolean;

  constructor(
    name: string,
    kind: SymbolKind,
    containerName: string,
    locationOrUri: Location | Uri,
    data: LSPAny | undefined,
  ) {
    const hasRange = !(locationOrUri instanceof Uri);
    super(
      name,
      kind,
      containerName,
      hasRange ? locationOrUri : new Location(locationOrUri, new Range(0, 0, 0, 0)),
    );
    this.hasRange = hasRange;
    if (data !== undefined) {
      this.data = data;
    }
  }
}
