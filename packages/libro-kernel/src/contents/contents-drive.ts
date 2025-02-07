import type { PartialJSONObject } from '@difizen/libro-common';
import { URL as URLUtil } from '@difizen/libro-common';
import type { Event as ManaEvent } from '@difizen/libro-common/mana-app';
import { inject, singleton } from '@difizen/libro-common/mana-app';
import { Emitter } from '@difizen/libro-common/mana-app';
import qs from 'query-string';

import type { ISettings } from '../server/index.js';
import { createResponseError, ServerConnection } from '../server/index.js';

import type {
  IContentsChangedArgs,
  IContentsCheckpointModel,
  IContentsCreateOptions,
  IContentsDrive,
  IContentsFetchOptions,
  IContentsModel,
  IContentsRequestOptions,
} from './contents-protocol.js';
import * as validate from './validate.js';

/**
 * The url for the default drive service.
 */
const SERVICE_DRIVE_URL = 'api/contents';

/**
 * The url for the file access.
 */
const FILES_URL = 'files';

function normalizeExtension(extension: string): string {
  if (extension.length > 0 && extension.indexOf('.') !== 0) {
    // eslint-disable-next-line no-param-reassign
    extension = `.${extension}`;
  }
  return extension;
}
/**
 * A default implementation for an `IContentsDrive`, talking to the
 * server using the Jupyter REST API.
 */
@singleton()
export class Drive implements IContentsDrive {
  @inject(ServerConnection) serverConnection: ServerConnection;

  /**
   * Construct a new contents manager object.
   *
   * @param options - The options used to initialize the object.
   */
  constructor() {
    this.apiEndpoint = SERVICE_DRIVE_URL;
  }

  /**
   * The name of the drive, which is used at the leading
   * component of file paths.
   */
  readonly name: string;

  /**
   * A signal emitted when a file operation takes place.
   */
  get fileChanged(): ManaEvent<IContentsChangedArgs> {
    return this.fileChangedEmitter.event;
  }

  /**
   * The server settings of the drive.
   */
  // readonly serverSettings: ISettings;

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
   * Get a file or directory.
   *
   * @param localPath: The path to the file.
   *
   * @param options: The options used to fetch the file.
   *
   * @returns A promise which resolves with the file content.
   *
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
   */
  async get(
    localPath: string,
    options?: IContentsFetchOptions,
  ): Promise<IContentsModel> {
    let url = this.getUrl(options?.baseUrl, localPath);
    const settings = this._getSettings(options?.baseUrl);

    if (options) {
      // The notebook type cannot take an format option.
      if (options.type === 'notebook') {
        delete options.format;
      }
      if (options.baseUrl) {
        delete options.baseUrl;
      }
      const content = options.content ? '1' : '0';
      const params: PartialJSONObject = { ...options, content };
      url += `?${qs.stringify(params)}`;
    }

    const response = await this.serverConnection.makeRequest(url, {}, settings);
    if (response.status !== 200) {
      const err = await createResponseError(response);
      throw err;
    }
    const data = await response.json();
    validate.validateContentsModel(data);
    return data;
  }

  /**
   * Get an encoded download url given a file path.
   *
   * @param localPath - An absolute POSIX file path on the server.
   *
   * #### Notes
   * It is expected that the path contains no relative paths.
   *
   * The returned URL may include a query parameter.
   */
  getDownloadUrl(
    localPath: string,
    options?: IContentsRequestOptions,
  ): Promise<string> {
    const baseUrl = options?.baseUrl || this.serverConnection.settings.baseUrl;
    let url = URLUtil.join(baseUrl, FILES_URL, URLUtil.encodeParts(localPath));
    const xsrfTokenMatch = document.cookie.match('\\b_xsrf=([^;]*)\\b');
    if (xsrfTokenMatch) {
      const fullUrl = new URL(url);
      fullUrl.searchParams.append('_xsrf', xsrfTokenMatch[1]);
      url = fullUrl.toString();
    }
    return Promise.resolve(url);
  }

  /**
   * Create a new untitled file or directory in the specified directory path.
   *
   * @param options: The options used to create the file.
   *
   * @returns A promise which resolves with the created file content when the
   *    file is created.
   *
   * #### Notes
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
   */
  async newUntitled(options: IContentsCreateOptions = {}): Promise<IContentsModel> {
    let body = '{}';
    const url = this.getUrl(options.baseUrl, options.path ?? '');
    const settings = this._getSettings(options.baseUrl);

    if (options) {
      if (options.ext) {
        options.ext = normalizeExtension(options.ext);
      }
      if (options.baseUrl) {
        delete options.baseUrl;
      }
      body = JSON.stringify(options);
    }

    const init = {
      method: 'POST',
      body,
    };
    const response = await this.serverConnection.makeRequest(url, init, settings);
    if (response.status !== 201) {
      const err = await createResponseError(response);
      throw err;
    }
    const data = await response.json();
    validate.validateContentsModel(data);
    this.fileChangedEmitter.fire({
      type: 'new',
      oldValue: null,
      newValue: data,
    });
    return data;
  }

  /**
   * Delete a file.
   *
   * @param localPath - The path to the file.
   *
   * @returns A promise which resolves when the file is deleted.
   *
   * #### Notes
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents).
   */
  async delete(localPath: string, options?: IContentsRequestOptions): Promise<void> {
    const url = this.getUrl(options?.baseUrl, localPath);
    const init = { method: 'DELETE' };
    const settings = this._getSettings(options?.baseUrl);
    const response = await this.serverConnection.makeRequest(url, init, settings);
    // TODO: update IPEP27 to specify errors more precisely, so
    // that error types can be detected here with certainty.
    if (response.status !== 204) {
      const err = await createResponseError(response);
      throw err;
    }
    this.fileChangedEmitter.fire({
      type: 'delete',
      oldValue: { path: localPath },
      newValue: null,
    });
  }

  /**
   * Rename a file or directory.
   *
   * @param oldLocalPath - The original file path.
   *
   * @param newLocalPath - The new file path.
   *
   * @returns A promise which resolves with the new file contents model when
   *   the file is renamed.
   *
   * #### Notes
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
   */
  async rename(
    oldLocalPath: string,
    newLocalPath: string,
    options?: IContentsRequestOptions,
  ): Promise<IContentsModel> {
    const url = this.getUrl(options?.baseUrl, oldLocalPath);
    const init = {
      method: 'PATCH',
      body: JSON.stringify({ path: newLocalPath }),
    };
    const settings = this._getSettings(options?.baseUrl);
    const response = await this.serverConnection.makeRequest(url, init, settings);
    if (response.status !== 200) {
      const err = await createResponseError(response);
      throw err;
    }
    const data = await response.json();
    validate.validateContentsModel(data);
    this.fileChangedEmitter.fire({
      type: 'rename',
      oldValue: { path: oldLocalPath },
      newValue: data,
    });
    return data;
  }

  /**
   * Save a file.
   *
   * @param localPath - The desired file path.
   *
   * @param options - Optional overrides to the model.
   *
   * @returns A promise which resolves with the file content model when the
   *   file is saved.
   *
   * #### Notes
   * Ensure that `model.content` is populated for the file.
   *
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
   */
  async save(
    localPath: string,
    options: Partial<IContentsModel> = {},
  ): Promise<IContentsModel> {
    const url = this.getUrl(options.baseUrl, localPath);
    const settings = this._getSettings(options.baseUrl);

    if (options) {
      if (options.baseUrl) {
        delete options.baseUrl;
      }
    }

    const init = {
      method: 'PUT',
      body: JSON.stringify(options),
    };
    const response = await this.serverConnection.makeRequest(url, init, settings);
    // will return 200 for an existing file and 201 for a new file
    if (response.status !== 200 && response.status !== 201) {
      const err = await createResponseError(response);
      throw err;
    }
    const data = await response.json();
    validate.validateContentsModel(data);
    this.fileChangedEmitter.fire({
      type: 'save',
      oldValue: null,
      newValue: data,
    });
    return data;
  }

  /**
   * Copy a file into a given directory.
   *
   * @param localPath - The original file path.
   *
   * @param toDir - The destination directory path.
   *
   * @returns A promise which resolves with the new contents model when the
   *  file is copied.
   *
   * #### Notes
   * The server will select the name of the copied file.
   *
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
   */
  async copy(
    fromFile: string,
    toDir: string,
    options?: IContentsRequestOptions,
  ): Promise<IContentsModel> {
    const url = this.getUrl(options?.baseUrl, toDir);
    const init = {
      method: 'POST',
      body: JSON.stringify({ copy_from: fromFile }),
    };
    const settings = this._getSettings(options?.baseUrl);
    const response = await this.serverConnection.makeRequest(url, init, settings);
    if (response.status !== 201) {
      const err = await createResponseError(response);
      throw err;
    }
    const data = await response.json();
    validate.validateContentsModel(data);
    this.fileChangedEmitter.fire({
      type: 'new',
      oldValue: null,
      newValue: data,
    });
    return data;
  }

  /**
   * Create a checkpoint for a file.
   *
   * @param localPath - The path of the file.
   *
   * @returns A promise which resolves with the new checkpoint model when the
   *   checkpoint is created.
   *
   * #### Notes
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
   */
  async createCheckpoint(
    localPath: string,
    options?: IContentsRequestOptions,
  ): Promise<IContentsCheckpointModel> {
    const url = this.getUrl(options?.baseUrl, localPath, 'checkpoints');
    const init = { method: 'POST' };
    const settings = this._getSettings(options?.baseUrl);
    const response = await this.serverConnection.makeRequest(url, init, settings);
    if (response.status !== 201) {
      const err = await createResponseError(response);
      throw err;
    }
    const data = await response.json();
    validate.validateCheckpointModel(data);
    return data;
  }

  /**
   * List available checkpoints for a file.
   *
   * @param localPath - The path of the file.
   *
   * @returns A promise which resolves with a list of checkpoint models for
   *    the file.
   *
   * #### Notes
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
   */
  async listCheckpoints(
    localPath: string,
    options?: IContentsRequestOptions,
  ): Promise<IContentsCheckpointModel[]> {
    const url = this.getUrl(options?.baseUrl, localPath, 'checkpoints');
    const settings = this._getSettings(options?.baseUrl);
    const response = await this.serverConnection.makeRequest(url, {}, settings);
    if (response.status !== 200) {
      const err = await createResponseError(response);
      throw err;
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid Checkpoint list');
    }
    for (let i = 0; i < data.length; i++) {
      validate.validateCheckpointModel(data[i]);
    }
    return data;
  }

  /**
   * Restore a file to a known checkpoint state.
   *
   * @param localPath - The path of the file.
   *
   * @param checkpointID - The id of the checkpoint to restore.
   *
   * @returns A promise which resolves when the checkpoint is restored.
   *
   * #### Notes
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents).
   */
  async restoreCheckpoint(
    localPath: string,
    checkpointID: string,
    options?: IContentsRequestOptions,
  ): Promise<void> {
    const url = this.getUrl(options?.baseUrl, localPath, 'checkpoints', checkpointID);
    const settings = this._getSettings(options?.baseUrl);
    const init = { method: 'POST' };
    const response = await this.serverConnection.makeRequest(url, init, settings);
    if (response.status !== 204) {
      const err = await createResponseError(response);
      throw err;
    }
  }

  /**
   * Delete a checkpoint for a file.
   *
   * @param localPath - The path of the file.
   *
   * @param checkpointID - The id of the checkpoint to delete.
   *
   * @returns A promise which resolves when the checkpoint is deleted.
   *
   * #### Notes
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents).
   */
  async deleteCheckpoint(
    localPath: string,
    checkpointID: string,
    options?: IContentsRequestOptions,
  ): Promise<void> {
    const url = this.getUrl(options?.baseUrl, localPath, 'checkpoints', checkpointID);
    const init = { method: 'DELETE' };
    const settings = this._getSettings(options?.baseUrl);
    const response = await this.serverConnection.makeRequest(url, init, settings);
    if (response.status !== 204) {
      const err = await createResponseError(response);
      throw err;
    }
  }

  /**
   * Get a REST url for a file given a path.
   */
  protected getUrl(base?: string, ...args: string[]): string {
    let baseUrl = base;
    if (!baseUrl) {
      baseUrl = this.serverConnection.settings.baseUrl;
    }
    const parts = args.map((path) => URLUtil.encodeParts(path));
    return URLUtil.join(baseUrl!, this.apiEndpoint, ...parts);
  }

  protected _getSettings(baseUrl?: string): ISettings {
    const settings = this.serverConnection.settings;
    if (baseUrl) {
      return { ...settings, baseUrl };
    }
    return settings;
  }

  protected apiEndpoint: string;
  protected _isDisposed = false;
  protected fileChangedEmitter = new Emitter<IContentsChangedArgs>();
}
