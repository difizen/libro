import { singleton } from '@difizen/mana-app';

@singleton()
export class CodeEditorInfoManager {
  editorHostRefMap: Map<string, React.RefObject<HTMLDivElement>>;

  constructor() {
    this.editorHostRefMap = new Map();
  }

  setEditorHostRef(id: string, ref: React.RefObject<HTMLDivElement>) {
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
