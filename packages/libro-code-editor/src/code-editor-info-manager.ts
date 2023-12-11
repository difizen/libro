import { singleton } from '@difizen/mana-app';

@singleton()
export class CodeEditorInfoManager {
  editorHostRefMap: Map<string, any>;

  constructor() {
    this.editorHostRefMap = new Map();
  }

  setEditorHostRef(id: string, ref: any) {
    if (!this.editorHostRefMap) {
      this.editorHostRefMap = new Map();
    }

    this.editorHostRefMap.set(id, ref);
  }

  getEditorHostRef(id: string) {
    if (!this.editorHostRefMap) {
      return undefined;
    }
    return this.editorHostRefMap.get(id);
  }
}
