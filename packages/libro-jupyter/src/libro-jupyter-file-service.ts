import type { INotebookContent } from '@difizen/libro-common';
import type { IContentsModel } from '@difizen/libro-kernel';
import { ServerManager, ContentsManager } from '@difizen/libro-kernel';
import { Emitter } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';
import type { URI } from '@difizen/mana-app';
import type { Event as ManaEvent } from '@difizen/mana-app';

import { LibroFileService } from './libro-jupyter-protocol.js';

export interface BaseStat {
  /**
   * The unified resource identifier of this file or folder.
   */
  resource: URI;

  /**
   * The name which is the last segment
   * of the {{path}}.
   */
  name: string;

  /**
   * The size of the file.
   *
   * The value may or may not be resolved as
   * it is optional.
   */
  size?: number;

  /**
   * The last modification date represented as millis from unix epoch.
   *
   * The value may or may not be resolved as
   * it is optional.
   */
  mtime?: number;

  /**
   * The creation date represented as millis from unix epoch.
   *
   * The value may or may not be resolved as
   * it is optional.
   */
  ctime?: number;

  /**
   * A unique identifier that represents the
   * current state of the file or directory.
   *
   * The value may or may not be resolved as
   * it is optional.
   */
  etag?: string;
}

export interface BaseStatWithMetadata extends BaseStat {
  mtime: number;
  ctime: number;
  etag: string;
  size: number;
}

/**
 * A file resource with meta information.
 */
export interface FileStat extends BaseStat {
  /**
   * The resource is a file.
   */
  isFile: boolean;

  /**
   * The resource is a directory.
   */
  isDirectory: boolean;

  /**
   * The resource is a symbolic link.
   */
  isSymbolicLink: boolean;

  /**
   * The children of the file stat or undefined if none.
   */
  children?: FileStat[];
}

export interface FileStatWithMetadata extends FileStat, BaseStatWithMetadata {
  mtime: number;
  ctime: number;
  etag: string;
  size: number;
  type?: number;
  children?: FileStatWithMetadata[];
}
export interface FileMeta extends Omit<FileStatWithMetadata, 'children' | 'resource'> {
  resource: string;
  children?: FileMeta[];
}

export class LibroFileError extends Error {
  protected errorCause?: string;
  constructor(message: string, errorCause?: string) {
    super(message);
    this.errorCause = errorCause;
  }
}

@singleton({ contrib: LibroFileService })
export class LibroJupyterFileService implements LibroFileService {
  protected readonly contentsManager: ContentsManager;
  protected serverManager: ServerManager;
  fileSaveErrorEmitter: Emitter<
    Partial<IContentsModel> & { msg?: string; cause?: string }
  >;

  /**
   * A signal emitted when the file save error.
   */
  get fileSaveError(): ManaEvent<Partial<IContentsModel>> {
    return this.fileSaveErrorEmitter.event;
  }

  constructor(
    @inject(ContentsManager)
    contentsManager: ContentsManager,
    @inject(ServerManager)
    serverManager: ServerManager,
  ) {
    this.contentsManager = contentsManager;
    this.serverManager = serverManager;
    this.fileSaveErrorEmitter = new Emitter<
      Partial<IContentsModel> & { msg?: string; cause?: string }
    >();
  }

  async read(path: string): Promise<IContentsModel | undefined> {
    await this.serverManager.ready;
    return await this.contentsManager.get(path);
  }

  async write(
    notebookContent: INotebookContent,
    currentFileContents: IContentsModel,
  ): Promise<IContentsModel | undefined> {
    await this.serverManager.ready;
    try {
      return await this.contentsManager.save(currentFileContents.path, {
        type: currentFileContents.type,
        content: notebookContent,
        format: currentFileContents.format,
      });
    } catch (e: any) {
      throw new LibroFileError(e.message, 'jupyter service save error');
    }
  }
}
