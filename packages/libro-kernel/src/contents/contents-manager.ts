import { PathExt } from '@difizen/libro-common';
import type { Event as ManaEvent } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';
import { Emitter } from '@difizen/mana-app';

import { Drive } from './contents-drive.js';
import type { IContentsDrive } from './contents-protocol.js';
import type {
  IContentsChangedArgs,
  IContentsFetchOptions,
  IContentsManager,
  IContentsModel,
  IContentsRequestOptions,
  IContentsCreateOptions,
  IContentsCheckpointModel,
} from './contents-protocol.js';

/**
 * A contents manager that passes file operations to the server.
 * Multiple servers implementing the `IContentsDrive` interface can be
 * attached to the contents manager, so that the same session can
 * perform file operations on multiple backends.
 *
 * This includes checkpointing with the normal file operations.
 */
@singleton()
export class ContentsManager implements IContentsManager {
  constructor(@inject(Drive) defaultDrive: IContentsDrive) {
    this.defaultDrive = defaultDrive;
    this.defaultDrive.fileChanged((args) =>
      this.onFileChanged(this.defaultDrive, args),
    );
  }

  /**
   * The server settings associated with the manager.
   */
  // serverSettings: ISettings;

  /**
   * A signal emitted when a file operation takes place.
   */
  get fileChanged(): ManaEvent<IContentsChangedArgs> {
    // return this._fileChanged;
    return this.fileChangedEmitter.event;
  }

  /**
   * Test whether the manager has been disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Dispose of the resources held by the manager.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._isDisposed = true;
    this.fileChangedEmitter.dispose();
  }

  /**
   * Add an `IContentsDrive` to the manager.
   */
  addDrive(drive: IContentsDrive): void {
    this.additionalDrives.set(drive.name, drive);
    drive.fileChanged((args) => this.onFileChanged(drive, args));
  }

  /**
   * Given a path, get a ModelDB.IFactory from the
   * relevant backend. Returns `undefined` if the backend
   * does not provide one.
   */
  // getModelDBFactory(path: string): ModelDB.IFactory | null {
  //   const [drive] = this.driveForPath(path);
  //   return drive?.modelDBFactory ?? null;
  // }

  /**
   * Given a path of the form `drive:local/portion/of/it.txt`
   * get the local part of it.
   *
   * @param path: the path.
   *
   * @returns The local part of the path.
   */
  localPath(path: string): string {
    const parts = path.split('/');
    const firstParts = parts[0].split(':');
    if (firstParts.length === 1 || !this.additionalDrives.has(firstParts[0])) {
      return PathExt.removeSlash(path);
    }
    return PathExt.join(firstParts.slice(1).join(':'), ...parts.slice(1));
  }

  /**
   * Normalize a global path. Reduces '..' and '.' parts, and removes
   * leading slashes from the local part of the path, while retaining
   * the drive name if it exists.
   *
   * @param path: the path.
   *
   * @returns The normalized path.
   */
  normalize(path: string): string {
    const parts = path.split(':');
    if (parts.length === 1) {
      return PathExt.normalize(path);
    }
    return `${parts[0]}:${PathExt.normalize(parts.slice(1).join(':'))}`;
  }

  /**
   * Resolve a global path, starting from the root path. Behaves like
   * posix-path.resolve, with 3 differences:
   *  - will never prepend cwd
   *  - if root has a drive name, the result is prefixed with "<drive>:"
   *  - before adding drive name, leading slashes are removed
   *
   * @param path: the path.
   *
   * @returns The normalized path.
   */
  resolvePath(root: string, path: string): string {
    const driveName = this.driveName(root);
    const localPath = this.localPath(root);
    const resolved = PathExt.resolve('/', localPath, path);
    return driveName ? `${driveName}:${resolved}` : resolved;
  }

  /**
   * Given a path of the form `drive:local/portion/of/it.txt`
   * get the name of the drive. If the path is missing
   * a drive portion, returns an empty string.
   *
   * @param path: the path.
   *
   * @returns The drive name for the path, or the empty string.
   */
  driveName(path: string): string {
    const parts = path.split('/');
    const firstParts = parts[0].split(':');
    if (firstParts.length === 1) {
      return '';
    }
    if (this.additionalDrives.has(firstParts[0])) {
      return firstParts[0];
    }
    return '';
  }

  /**
   * Get a file or directory.
   *
   * @param path: The path to the file.
   *
   * @param options: The options used to fetch the file.
   *
   * @returns A promise which resolves with the file content.
   */
  get(path: string, options?: IContentsFetchOptions): Promise<IContentsModel> {
    const [drive, localPath] = this.driveForPath(path);
    return drive.get(localPath, options).then((contentsModel) => {
      const listing: IContentsModel[] = [];
      if (contentsModel.type === 'directory' && contentsModel.content) {
        for (const item of contentsModel.content) {
          listing.push({ ...item, path: this.toGlobalPath(drive, item.path) });
        }
        return {
          ...contentsModel,
          path: this.toGlobalPath(drive, localPath),
          content: listing,
        } as IContentsModel;
      } else {
        return {
          ...contentsModel,
          path: this.toGlobalPath(drive, localPath),
        } as IContentsModel;
      }
    });
  }

  /**
   * Get an encoded download url given a file path.
   *
   * @param path - An absolute POSIX file path on the server.
   *
   * #### Notes
   * It is expected that the path contains no relative paths.
   *
   * The returned URL may include a query parameter.
   */
  getDownloadUrl(path: string, options?: IContentsRequestOptions): Promise<string> {
    const [drive, localPath] = this.driveForPath(path);
    return drive.getDownloadUrl(localPath, options);
  }

  /**
   * Create a new untitled file or directory in the specified directory path.
   *
   * @param options: The options used to create the file.
   *
   * @returns A promise which resolves with the created file content when the
   *    file is created.
   */
  newUntitled(options: IContentsCreateOptions = {}): Promise<IContentsModel> {
    if (options.path) {
      const globalPath = this.normalize(options.path);
      const [drive, localPath] = this.driveForPath(globalPath);
      return drive
        .newUntitled({ ...options, path: localPath })
        .then((contentsModel) => {
          return {
            ...contentsModel,
            path: PathExt.join(globalPath, contentsModel.name),
          } as IContentsModel;
        });
    } else {
      return this.defaultDrive.newUntitled(options);
    }
  }

  /**
   * Delete a file.
   *
   * @param path - The path to the file.
   *
   * @returns A promise which resolves when the file is deleted.
   */
  delete(path: string, options?: IContentsRequestOptions): Promise<void> {
    const [drive, localPath] = this.driveForPath(path);
    return drive.delete(localPath, options);
  }

  /**
   * Rename a file or directory.
   *
   * @param path - The original file path.
   *
   * @param newPath - The new file path.
   *
   * @returns A promise which resolves with the new file contents model when
   *   the file is renamed.
   */
  rename(
    path: string,
    newPath: string,
    options?: IContentsRequestOptions,
  ): Promise<IContentsModel> {
    const [drive1, path1] = this.driveForPath(path);
    const [drive2, path2] = this.driveForPath(newPath);
    if (drive1 !== drive2) {
      throw Error('ContentsManager: renaming files must occur within a Drive');
    }
    return drive1.rename(path1, path2, options).then((contentsModel) => {
      return {
        ...contentsModel,
        path: this.toGlobalPath(drive1, path2),
      } as IContentsModel;
    });
  }

  /**
   * Save a file.
   *
   * @param path - The desired file path.
   *
   * @param options - Optional overrides to the model.
   *
   * @returns A promise which resolves with the file content model when the
   *   file is saved.
   *
   * #### Notes
   * Ensure that `model.content` is populated for the file.
   */
  save(path: string, options: Partial<IContentsModel> = {}): Promise<IContentsModel> {
    const globalPath = this.normalize(path);
    const [drive, localPath] = this.driveForPath(path);
    return drive
      .save(localPath, { ...options, path: localPath })
      .then((contentsModel) => {
        return { ...contentsModel, path: globalPath } as IContentsModel;
      });
  }

  /**
   * Copy a file into a given directory.
   *
   * @param path - The original file path.
   *
   * @param toDir - The destination directory path.
   *
   * @returns A promise which resolves with the new contents model when the
   *  file is copied.
   *
   * #### Notes
   * The server will select the name of the copied file.
   */
  copy(
    fromFile: string,
    toDir: string,
    options?: IContentsRequestOptions,
  ): Promise<IContentsModel> {
    const [drive1, path1] = this.driveForPath(fromFile);
    const [drive2, path2] = this.driveForPath(toDir);
    if (drive1 === drive2) {
      return drive1.copy(path1, path2, options).then((contentsModel) => {
        return {
          ...contentsModel,
          path: this.toGlobalPath(drive1, contentsModel.path),
        } as IContentsModel;
      });
    } else {
      throw Error('Copying files between drives is not currently implemented');
    }
  }

  /**
   * Create a checkpoint for a file.
   *
   * @param path - The path of the file.
   *
   * @returns A promise which resolves with the new checkpoint model when the
   *   checkpoint is created.
   */
  createCheckpoint(
    path: string,
    options?: IContentsRequestOptions,
  ): Promise<IContentsCheckpointModel> {
    const [drive, localPath] = this.driveForPath(path);
    return drive.createCheckpoint(localPath, options);
  }

  /**
   * List available checkpoints for a file.
   *
   * @param path - The path of the file.
   *
   * @returns A promise which resolves with a list of checkpoint models for
   *    the file.
   */
  listCheckpoints(
    path: string,
    options?: IContentsRequestOptions,
  ): Promise<IContentsCheckpointModel[]> {
    const [drive, localPath] = this.driveForPath(path);
    return drive.listCheckpoints(localPath, options);
  }

  /**
   * Restore a file to a known checkpoint state.
   *
   * @param path - The path of the file.
   *
   * @param checkpointID - The id of the checkpoint to restore.
   *
   * @returns A promise which resolves when the checkpoint is restored.
   */
  restoreCheckpoint(
    path: string,
    checkpointID: string,
    options?: IContentsRequestOptions,
  ): Promise<void> {
    const [drive, localPath] = this.driveForPath(path);
    return drive.restoreCheckpoint(localPath, checkpointID, options);
  }

  /**
   * Delete a checkpoint for a file.
   *
   * @param path - The path of the file.
   *
   * @param checkpointID - The id of the checkpoint to delete.
   *
   * @returns A promise which resolves when the checkpoint is deleted.
   */
  deleteCheckpoint(
    path: string,
    checkpointID: string,
    options?: IContentsRequestOptions,
  ): Promise<void> {
    const [drive, localPath] = this.driveForPath(path);
    return drive.deleteCheckpoint(localPath, checkpointID, options);
  }

  /**
   * Given a drive and a local path, construct a fully qualified
   * path. The inverse of `driveForPath`.
   *
   * @param drive: an `IContentsDrive`.
   *
   * @param localPath: the local path on the drive.
   *
   * @returns the fully qualified path.
   */
  protected toGlobalPath(drive: IContentsDrive, localPath: string): string {
    if (drive === this.defaultDrive) {
      return PathExt.removeSlash(localPath);
    } else {
      return `${drive.name}:${PathExt.removeSlash(localPath)}`;
    }
  }

  /**
   * Given a path, get the `IContentsDrive to which it refers,
   * where the path satisfies the pattern
   * `'driveName:path/to/file'`. If there is no `driveName`
   * prepended to the path, it returns the default drive.
   *
   * @param path: a path to a file.
   *
   * @returns A tuple containing an `IContentsDrive` object for the path,
   * and a local path for that drive.
   */
  protected driveForPath(path: string): [IContentsDrive, string] {
    const driveName = this.driveName(path);
    const localPath = this.localPath(path);
    if (driveName) {
      return [this.additionalDrives.get(driveName)!, localPath];
    } else {
      return [this.defaultDrive, localPath];
    }
  }

  /**
   * Respond to fileChanged signals from the drives attached to
   * the manager. This prepends the drive name to the path if necessary,
   * and then forwards the signal.
   */
  protected onFileChanged(sender: IContentsDrive, args: IContentsChangedArgs) {
    if (sender === this.defaultDrive) {
      this.fileChangedEmitter.fire(args);
    } else {
      let newValue: Partial<IContentsModel> | null = null;
      let oldValue: Partial<IContentsModel> | null = null;
      if (args.newValue?.path) {
        newValue = {
          ...args.newValue,
          path: this.toGlobalPath(sender, args.newValue.path),
        };
      }
      if (args.oldValue?.path) {
        oldValue = {
          ...args.oldValue,
          path: this.toGlobalPath(sender, args.oldValue.path),
        };
      }
      this.fileChangedEmitter.fire({
        type: args.type,
        newValue,
        oldValue,
      });
    }
  }

  protected _isDisposed = false;
  protected additionalDrives = new Map<string, IContentsDrive>();
  protected defaultDrive: IContentsDrive;
  protected fileChangedEmitter = new Emitter<IContentsChangedArgs>();
}
