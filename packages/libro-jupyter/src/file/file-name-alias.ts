import type { URI } from '@difizen/libro-common/app';
import { singleton } from '@difizen/libro-common/app';

@singleton()
export class FileNameAlias {
  protected aliases = new Map<string, string>();

  set(uri: URI, name: string) {
    this.aliases.set(uri.path.toString(), name);
  }

  get(uri: URI) {
    return this.aliases.get(uri.path.toString());
  }
}
