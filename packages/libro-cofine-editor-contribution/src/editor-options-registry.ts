import { singleton } from '@difizen/libro-common/app';
import type monaco from '@difizen/monaco-editor-core';

@singleton()
export class EditorOptionsRegistry {
  protected optionsMap = new Map<monaco.Uri, any>();

  set(uri: monaco.Uri, data: any) {
    this.optionsMap.set(uri, data);
  }

  get(uri: monaco.Uri) {
    return this.optionsMap.get(uri);
  }
}
