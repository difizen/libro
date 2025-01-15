/* eslint-disable @typescript-eslint/no-unused-vars */
import { Emitter } from '@difizen/mana-common';
import type { URI } from '@difizen/mana-common';
import { singleton } from '@difizen/mana-syringe';

import type {
  CopyFileOptions,
  MoveFileOptions,
  ResolveFileOptions,
  FileChangesEvent,
  FileOperationEvent,
  FileStatWithMetadata,
} from './files';

const defaultFileMeta = {
  mtime: 0,
  ctime: 0,
  etag: '',
  size: 0,
  isFile: false,
  isDirectory: false,
  isSymbolicLink: false,
};
@singleton()
export class FileService {
  // #region File Watching

  private onDidFilesChangeEmitter = new Emitter<FileChangesEvent>();
  /**
   * An event that is emitted when files are changed on the disk.
   */
  readonly onDidFilesChange = this.onDidFilesChangeEmitter.event;

  // #endregion

  private onDidRunOperationEmitter = new Emitter<FileOperationEvent>();
  /**
   * An event that is emitted when operation is finished.
   * This event is triggered by user gestures and programmatically.
   */
  readonly onDidRunOperation = this.onDidRunOperationEmitter.event;

  async copy(
    source: URI,
    _target: URI,
    _options?: CopyFileOptions,
  ): Promise<FileStatWithMetadata> {
    return this.resolve(source);
  }
  async move(
    source: URI,
    _target: URI,
    _options?: MoveFileOptions,
  ): Promise<FileStatWithMetadata> {
    return this.resolve(source);
  }
  async resolve(
    resource: URI,
    _options?: ResolveFileOptions | undefined,
  ): Promise<FileStatWithMetadata> {
    return {
      ...defaultFileMeta,
      resource,
      name: resource.path.base,
    };
  }
}
