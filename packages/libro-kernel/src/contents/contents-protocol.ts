import type { Disposable, Event as ManaEvent } from '@difizen/mana-app';

import type { ISettings } from '../server/index.js';

/**
 * The options used to fetch a file.
 */
export interface IContentsRequestOptions {
  baseUrl?: string;
}

/**
 * A contents file type. It can be anything but `jupyter-server`
 * has special treatment for `notebook` and `directory` types.
 * Anything else is considered as `file` type.
 */
export type ContentType = string;

/**
 * A contents file format.
 */
export type ContentsFileFormat = 'json' | 'text' | 'base64' | null;

/**
 * A contents model.
 */
export interface IContentsModel extends IContentsRequestOptions {
  /**
   * Name of the contents file.
   *
   * #### Notes
   *  Equivalent to the last part of the `path` field.
   */
  name: string;

  /**
   * The full file path.
   *
   * #### Notes
   * It will *not* start with `/`, and it will be `/`-delimited.
   */
  path: string;

  /**
   * The type of file.
   */
  type: ContentType;

  /**
   * Whether the requester has permission to edit the file.
   */
  writable: boolean;

  /**
   * File creation timestamp.
   */
  created: string;

  /**
   * Last modified timestamp.
   */
  last_modified: string;

  /**
   * Specify the mime-type of file contents.
   *
   * #### Notes
   * Only non-`null` when `content` is present and `type` is `"file"`.
   */
  mimetype?: string;

  /**
   * The optional file content.
   */
  content: any;

  /**
   * The chunk of the file upload.
   */
  chunk?: number;

  /**
   * The format of the file `content`.
   *
   * #### Notes
   * Only relevant for type: 'file'
   */
  format?: ContentsFileFormat;

  /**
   * The size of then file in bytes.
   */
  size?: number;

  /**
   * The indices of the matched characters in the name.
   */
  indices?: readonly number[] | null;

  message?: string;
}

/**
 * The options used to fetch a file.
 */
export interface IContentsFetchOptions extends IContentsRequestOptions {
  /**
   * The override file type for the request.
   */
  type?: ContentType;

  /**
   * The override file format for the request.
   */
  format?: ContentsFileFormat;

  /**
   * Whether to include the file content.
   *
   * The default is `true`.
   */
  content?: boolean;
}

/**
 * The options used to create a file.
 */
export interface IContentsCreateOptions extends IContentsRequestOptions {
  /**
   * The directory in which to create the file.
   */
  path?: string;

  /**
   * The optional file extension for the new file (e.g. `".txt"`).
   *
   * #### Notes
   * This ignored if `type` is `'notebook'`.
   */
  ext?: string;

  /**
   * The file type.
   */
  type?: ContentType;
}

/**
 * Checkpoint model.
 */
export interface IContentsCheckpointModel {
  /**
   * The unique identifier for the checkpoint.
   */
  readonly id: string;

  /**
   * Last modified timestamp.
   */
  readonly last_modified: string;
}

/**
 * The change args for a file change.
 */
export interface IContentsChangedArgs {
  /**
   * The type of change.
   */
  type: 'new' | 'delete' | 'rename' | 'save';

  /**
   * The new contents.
   */
  oldValue: Partial<IContentsModel> | null;

  /**
   * The old contents.
   */
  newValue: Partial<IContentsModel> | null;
}
/**
 * The interface for a contents manager.
 */
export interface IContentsManager extends Disposable {
  /**
   * A signal emitted when a file operation takes place.
   */
  readonly fileChanged: ManaEvent<IContentsChangedArgs>;

  /**
   * The server settings associated with the manager.
   */
  // serverSettings: ISettings;

  /**
   * Add an `IContentsDrive` to the manager.
   */
  addDrive: (drive: IContentsDrive) => void;

  /**
   * Given a path of the form `drive:local/portion/of/it.txt`
   * get the local part of it.
   *
   * @param path: the path.
   *
   * @returns The local part of the path.
   */
  localPath: (path: string) => string;

  /**
   * Normalize a global path. Reduces '..' and '.' parts, and removes
   * leading slashes from the local part of the path, while retaining
   * the drive name if it exists.
   *
   * @param path: the path.
   *
   * @returns The normalized path.
   */
  normalize: (path: string) => string;

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
  resolvePath: (root: string, path: string) => string;

  /**
   * Given a path of the form `drive:local/portion/of/it.txt`
   * get the name of the drive. If the path is missing
   * a drive portion, returns an empty string.
   *
   * @param path: the path.
   *
   * @returns The drive name for the path, or the empty string.
   */
  driveName: (path: string) => string;

  /**
   * Given a path, get a ModelDB.IFactory from the
   * relevant backend. Returns `null` if the backend
   * does not provide one.
   */
  // getModelDBFactory(path: string): ModelDB.IFactory | null;

  /**
   * Get a file or directory.
   *
   * @param path: The path to the file.
   *
   * @param options: The options used to fetch the file.
   *
   * @returns A promise which resolves with the file content.
   */
  get: (path: string, options?: IContentsFetchOptions) => Promise<IContentsModel>;

  /**
   * Get an encoded download url given a file path.
   *
   * @param A promise which resolves with the absolute POSIX
   *   file path on the server.
   *
   * #### Notes
   * The returned URL may include a query parameter.
   */
  getDownloadUrl: (path: string, options?: IContentsRequestOptions) => Promise<string>;

  /**
   * Create a new untitled file or directory in the specified directory path.
   *
   * @param options: The options used to create the file.
   *
   * @returns A promise which resolves with the created file content when the
   *    file is created.
   */
  newUntitled: (options?: IContentsCreateOptions) => Promise<IContentsModel>;

  /**
   * Delete a file.
   *
   * @param path - The path to the file.
   *
   * @returns A promise which resolves when the file is deleted.
   */
  delete: (path: string, options?: IContentsRequestOptions) => Promise<void>;

  /**
   * Rename a file or directory.
   *
   * @param path - The original file path.
   *
   * @param newPath - The new file path.
   *
   * @returns A promise which resolves with the new file content model when the
   *   file is renamed.
   */
  rename: (
    path: string,
    newPath: string,
    options?: IContentsRequestOptions,
  ) => Promise<IContentsModel>;

  /**
   * Save a file.
   *
   * @param path - The desired file path.
   *
   * @param options - Optional overrides to the model.
   *
   * @returns A promise which resolves with the file content model when the
   *   file is saved.
   */
  save: (path: string, options?: Partial<IContentsModel>) => Promise<IContentsModel>;

  /**
   * Copy a file into a given directory.
   *
   * @param path - The original file path.
   *
   * @param toDir - The destination directory path.
   *
   * @returns A promise which resolves with the new content model when the
   *  file is copied.
   */
  copy: (
    path: string,
    toDir: string,
    options?: IContentsRequestOptions,
  ) => Promise<IContentsModel>;

  /**
   * Create a checkpoint for a file.
   *
   * @param path - The path of the file.
   *
   * @returns A promise which resolves with the new checkpoint model when the
   *   checkpoint is created.
   */
  createCheckpoint: (
    path: string,
    options?: IContentsRequestOptions,
  ) => Promise<IContentsCheckpointModel>;

  /**
   * List available checkpoints for a file.
   *
   * @param path - The path of the file.
   *
   * @returns A promise which resolves with a list of checkpoint models for
   *    the file.
   */
  listCheckpoints: (
    path: string,
    options?: IContentsRequestOptions,
  ) => Promise<IContentsCheckpointModel[]>;

  /**
   * Restore a file to a known checkpoint state.
   *
   * @param path - The path of the file.
   *
   * @param checkpointID - The id of the checkpoint to restore.
   *
   * @returns A promise which resolves when the checkpoint is restored.
   */
  restoreCheckpoint: (
    path: string,
    checkpointID: string,
    options?: IContentsRequestOptions,
  ) => Promise<void>;

  /**
   * Delete a checkpoint for a file.
   *
   * @param path - The path of the file.
   *
   * @param checkpointID - The id of the checkpoint to delete.
   *
   * @returns A promise which resolves when the checkpoint is deleted.
   */
  deleteCheckpoint: (
    path: string,
    checkpointID: string,
    options?: IContentsRequestOptions,
  ) => Promise<void>;
}
/**
 * The interface for a network drive that can be mounted
 * in the contents manager.
 */
export interface IContentsDrive extends Disposable {
  /**
   * The name of the drive, which is used at the leading
   * component of file paths.
   */
  readonly name: string;

  /**
   * The server settings of the manager.
   */
  // readonly serverSettings: ISettings;

  /**
   * An optional ModelDB.IFactory instance for the
   * drive.
   */
  // readonly modelDBFactory?: ModelDB.IFactory;

  /**
   * A signal emitted when a file operation takes place.
   */
  fileChanged: ManaEvent<IContentsChangedArgs>;

  /**
   * Get a file or directory.
   *
   * @param localPath: The path to the file.
   *
   * @param options: The options used to fetch the file.
   *
   * @returns A promise which resolves with the file content.
   */
  get: (localPath: string, options?: IContentsFetchOptions) => Promise<IContentsModel>;

  /**
   * Get an encoded download url given a file path.
   *
   * @param A promise which resolves with the absolute POSIX
   *   file path on the server.
   *
   * #### Notes
   * The returned URL may include a query parameter.
   */
  getDownloadUrl: (
    localPath: string,
    options?: IContentsRequestOptions,
  ) => Promise<string>;

  /**
   * Create a new untitled file or directory in the specified directory path.
   *
   * @param options: The options used to create the file.
   *
   * @returns A promise which resolves with the created file content when the
   *    file is created.
   */
  newUntitled: (options?: IContentsCreateOptions) => Promise<IContentsModel>;

  /**
   * Delete a file.
   *
   * @param localPath - The path to the file.
   *
   * @returns A promise which resolves when the file is deleted.
   */
  delete: (localPath: string, options?: IContentsRequestOptions) => Promise<void>;

  /**
   * Rename a file or directory.
   *
   * @param oldLocalPath - The original file path.
   *
   * @param newLocalPath - The new file path.
   *
   * @returns A promise which resolves with the new file content model when the
   *   file is renamed.
   */
  rename: (
    oldLocalPath: string,
    newLocalPath: string,
    options?: IContentsRequestOptions,
  ) => Promise<IContentsModel>;

  /**
   * Save a file.
   *
   * @param localPath - The desired file path.
   *
   * @param options - Optional overrides to the model.
   *
   * @returns A promise which resolves with the file content model when the
   *   file is saved.
   */
  save: (
    localPath: string,
    options?: Partial<IContentsModel>,
  ) => Promise<IContentsModel>;

  /**
   * Copy a file into a given directory.
   *
   * @param localPath - The original file path.
   *
   * @param toLocalDir - The destination directory path.
   *
   * @returns A promise which resolves with the new content model when the
   *  file is copied.
   */
  copy: (
    localPath: string,
    toLocalDir: string,
    options?: IContentsRequestOptions,
  ) => Promise<IContentsModel>;

  /**
   * Create a checkpoint for a file.
   *
   * @param localPath - The path of the file.
   *
   * @returns A promise which resolves with the new checkpoint model when the
   *   checkpoint is created.
   */
  createCheckpoint: (
    localPath: string,
    options?: IContentsRequestOptions,
  ) => Promise<IContentsCheckpointModel>;

  /**
   * List available checkpoints for a file.
   *
   * @param localPath - The path of the file.
   *
   * @returns A promise which resolves with a list of checkpoint models for
   *    the file.
   */
  listCheckpoints: (
    localPath: string,
    options?: IContentsRequestOptions,
  ) => Promise<IContentsCheckpointModel[]>;

  /**
   * Restore a file to a known checkpoint state.
   *
   * @param localPath - The path of the file.
   *
   * @param checkpointID - The id of the checkpoint to restore.
   *
   * @returns A promise which resolves when the checkpoint is restored.
   */
  restoreCheckpoint: (
    localPath: string,
    checkpointID: string,
    options?: IContentsRequestOptions,
  ) => Promise<void>;

  /**
   * Delete a checkpoint for a file.
   *
   * @param localPath - The path of the file.
   *
   * @param checkpointID - The id of the checkpoint to delete.
   *
   * @returns A promise which resolves when the checkpoint is deleted.
   */
  deleteCheckpoint: (
    localPath: string,
    checkpointID: string,
    options?: IContentsRequestOptions,
  ) => Promise<void>;
}

/**
 * The options used to initialize a contents manager.
 */
export interface IContentsManagerOptions {
  /**
   * The default drive backend for the contents manager.
   */
  defaultDrive?: IContentsDrive;

  /**
   * The server settings associated with the manager.
   */
  serverSettings?: ISettings;
}
/**
 * The options used to initialize a `Drive`.
 */
export interface IDriveOptions {
  /**
   * The name for the `Drive`, which is used in file
   * paths to disambiguate it from other drives.
   */
  name?: string;

  /**
   * The server settings for the server.
   */
  serverSettings?: ISettings;

  /**
   * A REST endpoint for drive requests.
   * If not given, defaults to the Jupyter
   * REST API given by [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents).
   */
  apiEndpoint?: string;
}
