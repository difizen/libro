export const CodeEditorViewerFactory = 'libro-lab-editor-viewer';

export const LibroDefaultViewerFactory = 'libro-lab-default-viewer';

export const textFileTypes: string[] = [
  '.py',
  '.txt',
  '.sh',
  '.tex',
  '.html',
  '.xml',
  '.log',
  '.ini',
  '.yaml',
  '.yml',
  '.js',
  '.ts',
  '.csv',
  '.css',
  '.conf',
  '.bat',
  '.json',
  '.jsonl',
  '.md',
  '.r',
  '',
];

export interface EditorOption {
  path: string;
  loadType?: string;
  name?: string;
}
