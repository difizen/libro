export enum FileType {
  Unknown = 0,
  File = 1,
  Directory = 2,
  SymbolicLink = 64,
}
export type DirItem = [string, FileType];

export interface EditorView {
  dirty: boolean;
}

export const EditorView = {
  is: (data?: Record<string, any>): data is EditorView => {
    return (
      !!data &&
      typeof data === 'object' &&
      'id' in data &&
      'view' in data &&
      'dirty' in data &&
      typeof data['view'] === 'function'
    );
  },
};
