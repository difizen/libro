import { URI } from '@difizen/mana-common';

import type { FileStat } from './files';

export namespace FileSystemUtils {
  /**
   * Generate unique URI for a given parent which does not collide
   *
   * @param parentUri the `URI` of the parent
   * @param parent the `FileStat` of the parent
   * @param name the resource name
   * @param ext the resource extension
   */
  export function generateUniqueResourceURI(
    parentUri: URI,
    parent: FileStat,
    name: string,
    ext = '',
  ): URI {
    const children = !parent.children
      ? []
      : parent.children!.map((child) => child.resource);

    let index = 1;
    let base = name + ext;
    while (children.some((child) => child.path.base === base)) {
      index += 1;
      base = `${name}_${index}${ext}`;
    }
    return URI.resolve(parentUri, base);
  }
}
