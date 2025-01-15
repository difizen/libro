import { URI } from '@difizen/mana-common';
import type { MenuPath } from '@difizen/mana-core';

export const FileTreeContextMenuPath: MenuPath = ['file-tree-context-menu'];

export interface URINode {
  uri: URI;
}

export namespace URINode {
  export function is(arg: object | undefined): arg is URINode {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return typeof arg === 'object' && 'uri' in arg && (<any>arg).uri instanceof URI;
  }

  export function getUri(selection: object | undefined): URI | undefined {
    if (is(selection)) {
      return selection.uri;
    }
    if (Array.isArray(selection) && is(selection[0])) {
      return selection[0].uri;
    }
    return undefined;
  }

  export function getUris(selection: object | undefined): URI[] {
    if (is(selection)) {
      return [selection.uri];
    }
    if (Array.isArray(selection)) {
      return selection.filter(is).map((s) => s.uri);
    }
    return [];
  }
}
