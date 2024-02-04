import type { FileStat, FileSystem, Uri } from 'vscode';

import { FileType } from './vscodeAdaptor.js';

export class LibroFS implements FileSystem {
  stat(uri: Uri): Thenable<FileStat> {
    return Promise.resolve<FileStat>({
      type: FileType.File,
      ctime: 0,
      mtime: 0,
      size: 0,
    });
  }
  readDirectory(uri: Uri): Thenable<[string, FileType][]> {
    throw new Error('Method not implemented.');
  }
  createDirectory(uri: Uri): Thenable<void> {
    throw new Error('Method not implemented.');
  }
  readFile(uri: Uri): Thenable<Uint8Array> {
    throw new Error('Method not implemented.');
  }
  writeFile(uri: Uri, content: Uint8Array): Thenable<void> {
    throw new Error('Method not implemented.');
  }
  delete(
    uri: Uri,
    options?:
      | { recursive?: boolean | undefined; useTrash?: boolean | undefined }
      | undefined,
  ): Thenable<void> {
    throw new Error('Method not implemented.');
  }
  rename(
    source: Uri,
    target: Uri,
    options?: { overwrite?: boolean | undefined } | undefined,
  ): Thenable<void> {
    throw new Error('Method not implemented.');
  }
  copy(
    source: Uri,
    target: Uri,
    options?: { overwrite?: boolean | undefined } | undefined,
  ): Thenable<void> {
    throw new Error('Method not implemented.');
  }
  isWritableFileSystem(scheme: string): boolean | undefined {
    throw new Error('Method not implemented.');
  }
}
