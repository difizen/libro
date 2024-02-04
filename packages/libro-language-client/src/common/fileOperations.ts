/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as proto from '@difizen/vscode-languageserver-protocol';
import * as minimatch from 'minimatch';
import type {
  Disposable,
  FileCreateEvent,
  FileRenameEvent,
  FileDeleteEvent,
  FileWillCreateEvent,
  FileWillRenameEvent,
  FileWillDeleteEvent,
  Event as VEvent,
  WorkspaceEdit,
  Uri,
  CancellationToken,
} from 'vscode';

import type {
  DynamicFeature,
  RegistrationData,
  NextSignature,
  FeatureState,
  FeatureClient,
} from './features.js';
import * as UUID from './utils/uuid.js';
import { FileType } from './vscodeAdaptor/vscodeAdaptor.js';
import { workspace } from './vscodeAdaptor/vscodeAdaptor.js';

function ensure<T, K extends keyof T>(target: T, key: K): T[K] {
  if (target[key] === void 0) {
    target[key] = {} as any;
  }
  return target[key];
}

function access<T, K extends keyof T>(target: T, key: K): T[K] {
  return target[key];
}

function assign<T, K extends keyof T>(target: T, key: K, value: T[K]): void {
  target[key] = value;
}

/**
 * File operation middleware
 *
 * @since 3.16.0
 */
export interface FileOperationsMiddleware {
  didCreateFiles?: NextSignature<FileCreateEvent, Promise<void>>;
  willCreateFiles?: NextSignature<
    FileWillCreateEvent,
    Thenable<WorkspaceEdit | null | undefined>
  >;
  didRenameFiles?: NextSignature<FileRenameEvent, Promise<void>>;
  willRenameFiles?: NextSignature<
    FileWillRenameEvent,
    Thenable<WorkspaceEdit | null | undefined>
  >;
  didDeleteFiles?: NextSignature<FileDeleteEvent, Promise<void>>;
  willDeleteFiles?: NextSignature<
    FileWillDeleteEvent,
    Thenable<WorkspaceEdit | null | undefined>
  >;
}

interface FileOperationsWorkspaceMiddleware {
  workspace?: FileOperationsMiddleware;
}

interface Event<I> {
  readonly files: ReadonlyArray<I>;
}

abstract class FileOperationFeature<I, E extends Event<I>>
  implements DynamicFeature<proto.FileOperationRegistrationOptions>
{
  protected readonly _client: FeatureClient<FileOperationsWorkspaceMiddleware>;
  private readonly _event: VEvent<E>;
  private readonly _registrationType: proto.RegistrationType<proto.FileOperationRegistrationOptions>;
  private readonly _clientCapability: keyof proto.FileOperationClientCapabilities;
  private readonly _serverCapability: keyof proto.FileOperationOptions;
  private _listener: Disposable | undefined;
  // This property must stay private. Otherwise the type `minimatch.IMinimatch` becomes public and as a consequence we would need to
  // ship the d.ts files for minimatch to make the compiler happy when compiling against the vscode-languageclient library
  private readonly _filters: Map<
    string,
    Array<{
      scheme?: string;
      matcher: minimatch.Minimatch;
      kind?: proto.FileOperationPatternKind;
    }>
  >;

  constructor(
    client: FeatureClient<FileOperationsWorkspaceMiddleware>,
    event: VEvent<E>,
    registrationType: proto.RegistrationType<proto.FileOperationRegistrationOptions>,
    clientCapability: keyof proto.FileOperationClientCapabilities,
    serverCapability: keyof proto.FileOperationOptions,
  ) {
    this._client = client;
    this._event = event;
    this._registrationType = registrationType;
    this._clientCapability = clientCapability;
    this._serverCapability = serverCapability;
    this._filters = new Map();
  }

  getState(): FeatureState {
    return {
      kind: 'workspace',
      id: this._registrationType.method,
      registrations: this._filters.size > 0,
    };
  }

  protected filterSize(): number {
    return this._filters.size;
  }

  public get registrationType(): proto.RegistrationType<proto.FileOperationRegistrationOptions> {
    return this._registrationType;
  }

  public fillClientCapabilities(capabilities: proto.ClientCapabilities): void {
    const value = ensure(ensure(capabilities, 'workspace')!, 'fileOperations')!;
    // this happens n times but it is the same value so we tolerate this.
    assign(value, 'dynamicRegistration', true);
    assign(value, this._clientCapability, true);
  }

  public initialize(capabilities: proto.ServerCapabilities): void {
    const options = capabilities.workspace?.fileOperations;
    const capability =
      options !== undefined ? access(options, this._serverCapability) : undefined;
    if (capability?.filters !== undefined) {
      try {
        this.register({
          id: UUID.generateUuid(),
          registerOptions: { filters: capability.filters },
        });
      } catch (e) {
        this._client.warn(
          `Ignoring invalid glob pattern for ${this._serverCapability} registration: ${e}`,
        );
      }
    }
  }

  public register(
    data: RegistrationData<proto.FileOperationRegistrationOptions>,
  ): void {
    if (!this._listener) {
      this._listener = this._event(this.send, this);
    }
    const minimatchFilter = data.registerOptions.filters.map((filter) => {
      const matcher = new minimatch.Minimatch(
        filter.pattern.glob,
        FileOperationFeature.asMinimatchOptions(filter.pattern.options),
      );
      if (!matcher.makeRe()) {
        throw new Error(`Invalid pattern ${filter.pattern.glob}!`);
      }
      return { scheme: filter.scheme, matcher, kind: filter.pattern.matches };
    });
    this._filters.set(data.id, minimatchFilter);
  }

  public abstract send(data: E): Promise<void>;

  public unregister(id: string): void {
    this._filters.delete(id);
    if (this._filters.size === 0 && this._listener) {
      this._listener.dispose();
      this._listener = undefined;
    }
  }

  public clear(): void {
    this._filters.clear();
    if (this._listener) {
      this._listener.dispose();
      this._listener = undefined;
    }
  }

  protected getFileType(uri: Uri): Promise<FileType | undefined> {
    return FileOperationFeature.getFileType(uri);
  }

  protected async filter(event: E, prop: (i: I) => Uri): Promise<E> {
    // (Asynchronously) map each file onto a boolean of whether it matches
    // any of the globs.
    const fileMatches = await Promise.all(
      event.files.map(async (item) => {
        const uri = prop(item);
        // Use fsPath to make this consistent with file system watchers but help
        // minimatch to use '/' instead of `\\` if present.
        const path = uri.fsPath.replace(/\\/g, '/');
        for (const filters of this._filters.values()) {
          for (const filter of filters) {
            if (filter.scheme !== undefined && filter.scheme !== uri.scheme) {
              continue;
            }
            if (filter.matcher.match(path)) {
              // The pattern matches. If kind is undefined then everything is ok
              if (filter.kind === undefined) {
                return true;
              }
              const fileType = await this.getFileType(uri);
              // If we can't determine the file type than we treat it as a match.
              // Dropping it would be another alternative.
              if (fileType === undefined) {
                this._client.error(
                  `Failed to determine file type for ${uri.toString()}.`,
                );
                return true;
              }
              if (
                (fileType === FileType.File &&
                  filter.kind === proto.FileOperationPatternKind.file) ||
                (fileType === FileType.Directory &&
                  filter.kind === proto.FileOperationPatternKind.folder)
              ) {
                return true;
              }
            } else if (filter.kind === proto.FileOperationPatternKind.folder) {
              const fileType = await FileOperationFeature.getFileType(uri);
              if (fileType === FileType.Directory && filter.matcher.match(`${path}/`)) {
                return true;
              }
            }
          }
        }
        return false;
      }),
    );

    // Filter the files to those that matched.
    const files = event.files.filter((_, index) => fileMatches[index]);

    return { ...event, files };
  }

  protected static async getFileType(uri: Uri): Promise<FileType | undefined> {
    try {
      return (await workspace.fs.stat(uri)).type;
    } catch (e) {
      return undefined;
    }
  }

  private static asMinimatchOptions(
    options: proto.FileOperationPatternOptions | undefined,
  ): minimatch.MinimatchOptions | undefined {
    // The spec doesn't state that dot files don't match. So we make
    // matching those the default.
    const result: minimatch.MinimatchOptions = { dot: true };
    if (options?.ignoreCase === true) {
      result.nocase = true;
    }
    return result;
  }
}

abstract class NotificationFileOperationFeature<
  I,
  E extends { readonly files: ReadonlyArray<I> },
  P,
> extends FileOperationFeature<I, E> {
  private _notificationType: proto.ProtocolNotificationType<
    P,
    proto.FileOperationRegistrationOptions
  >;
  private _accessUri: (i: I) => Uri;
  private _createParams: (e: E) => P;

  constructor(
    client: FeatureClient<FileOperationsWorkspaceMiddleware>,
    event: VEvent<E>,
    notificationType: proto.ProtocolNotificationType<
      P,
      proto.FileOperationRegistrationOptions
    >,
    clientCapability: keyof proto.FileOperationClientCapabilities,
    serverCapability: keyof proto.FileOperationOptions,
    accessUri: (i: I) => Uri,
    createParams: (e: E) => P,
  ) {
    super(client, event, notificationType, clientCapability, serverCapability);
    this._notificationType = notificationType;
    this._accessUri = accessUri;
    this._createParams = createParams;
  }

  public async send(originalEvent: E): Promise<void> {
    // Create a copy of the event that has the files filtered to match what the
    // server wants.
    const filteredEvent = await this.filter(originalEvent, this._accessUri);
    if (filteredEvent.files.length) {
      const next = async (event: E): Promise<void> => {
        return this._client.sendNotification(
          this._notificationType,
          this._createParams(event),
        );
      };
      return this.doSend(filteredEvent, next);
    }
  }

  protected abstract doSend(event: E, next: (event: E) => Promise<void>): Promise<void>;
}

abstract class CachingNotificationFileOperationFeature<
  I,
  E extends { readonly files: ReadonlyArray<I> },
  P,
> extends NotificationFileOperationFeature<I, E, P> {
  protected _willListener: Disposable | undefined;
  private readonly _fsPathFileTypes = new Map<string, FileType>();

  protected override async getFileType(uri: Uri): Promise<FileType | undefined> {
    const fsPath = uri.fsPath;
    if (this._fsPathFileTypes.has(fsPath)) {
      return this._fsPathFileTypes.get(fsPath);
    }

    const type = await FileOperationFeature.getFileType(uri);
    if (type) {
      this._fsPathFileTypes.set(fsPath, type);
    }
    return type;
  }

  protected async cacheFileTypes(event: E, prop: (i: I) => Uri) {
    // Calling filter will force the matching logic to run. For any item
    // that requires a getFileType lookup, the overriden getFileType will
    // be called that will cache the result so that when onDidRename fires,
    // it can still be checked even though the item no longer exists on disk
    // in its original location.
    await this.filter(event, prop);
  }

  protected clearFileTypeCache() {
    this._fsPathFileTypes.clear();
  }

  public override unregister(id: string): void {
    super.unregister(id);
    if (this.filterSize() === 0 && this._willListener) {
      this._willListener.dispose();
      this._willListener = undefined;
    }
  }

  public override clear(): void {
    super.clear();
    if (this._willListener) {
      this._willListener.dispose();
      this._willListener = undefined;
    }
  }
}

export class DidCreateFilesFeature extends NotificationFileOperationFeature<
  Uri,
  FileCreateEvent,
  proto.CreateFilesParams
> {
  constructor(client: FeatureClient<FileOperationsWorkspaceMiddleware>) {
    super(
      client,
      workspace.onDidCreateFiles,
      proto.DidCreateFilesNotification.type,
      'didCreate',
      'didCreate',
      (i: Uri) => i,
      client.code2ProtocolConverter.asDidCreateFilesParams,
    );
  }

  protected doSend(
    event: FileCreateEvent,
    next: (event: FileCreateEvent) => Promise<void>,
  ): Promise<void> {
    const middleware = this._client.middleware.workspace;
    return middleware?.didCreateFiles
      ? middleware.didCreateFiles(event, next)
      : next(event);
  }
}

export class DidRenameFilesFeature extends CachingNotificationFileOperationFeature<
  { oldUri: Uri; newUri: Uri },
  FileRenameEvent,
  proto.RenameFilesParams
> {
  constructor(client: FeatureClient<FileOperationsWorkspaceMiddleware>) {
    super(
      client,
      workspace.onDidRenameFiles,
      proto.DidRenameFilesNotification.type,
      'didRename',
      'didRename',
      (i: { oldUri: Uri; newUri: Uri }) => i.oldUri,
      client.code2ProtocolConverter.asDidRenameFilesParams,
    );
  }

  public override register(
    data: RegistrationData<proto.FileOperationRegistrationOptions>,
  ): void {
    if (!this._willListener) {
      this._willListener = workspace.onWillRenameFiles(this.willRename, this);
    }
    super.register(data);
  }

  private willRename(e: FileWillRenameEvent): void {
    e.waitUntil(this.cacheFileTypes(e, (i) => i.oldUri));
  }

  protected doSend(
    event: FileRenameEvent,
    next: (event: FileRenameEvent) => Promise<void>,
  ): Promise<void> {
    this.clearFileTypeCache();
    const middleware = this._client.middleware.workspace;
    return middleware?.didRenameFiles
      ? middleware.didRenameFiles(event, next)
      : next(event);
  }
}

export class DidDeleteFilesFeature extends CachingNotificationFileOperationFeature<
  Uri,
  FileDeleteEvent,
  proto.DeleteFilesParams
> {
  constructor(client: FeatureClient<FileOperationsWorkspaceMiddleware>) {
    super(
      client,
      workspace.onDidDeleteFiles,
      proto.DidDeleteFilesNotification.type,
      'didDelete',
      'didDelete',
      (i: Uri) => i,
      client.code2ProtocolConverter.asDidDeleteFilesParams,
    );
  }

  public override register(
    data: RegistrationData<proto.FileOperationRegistrationOptions>,
  ): void {
    if (!this._willListener) {
      this._willListener = workspace.onWillDeleteFiles(this.willDelete, this);
    }
    super.register(data);
  }

  private willDelete(e: FileWillDeleteEvent): void {
    e.waitUntil(this.cacheFileTypes(e, (i) => i));
  }

  protected doSend(
    event: FileCreateEvent,
    next: (event: FileCreateEvent) => Promise<void>,
  ): Promise<void> {
    this.clearFileTypeCache();
    const middleware = this._client.middleware.workspace;
    return middleware?.didDeleteFiles
      ? middleware.didDeleteFiles(event, next)
      : next(event);
  }
}

interface RequestEvent<I> {
  readonly token: CancellationToken;
  readonly files: ReadonlyArray<I>;
  waitUntil(thenable: Thenable<WorkspaceEdit>): void;
  waitUntil(thenable: Thenable<any>): void;
}

abstract class RequestFileOperationFeature<
  I,
  E extends RequestEvent<I>,
  P,
> extends FileOperationFeature<I, E> {
  private _requestType: proto.ProtocolRequestType<
    P,
    proto.WorkspaceEdit | null,
    never,
    void,
    proto.FileOperationRegistrationOptions
  >;
  private _accessUri: (i: I) => Uri;
  private _createParams: (e: Event<I>) => P;

  constructor(
    client: FeatureClient<FileOperationsWorkspaceMiddleware>,
    event: VEvent<E>,
    requestType: proto.ProtocolRequestType<
      P,
      proto.WorkspaceEdit | null,
      never,
      void,
      proto.FileOperationRegistrationOptions
    >,
    clientCapability: keyof proto.FileOperationClientCapabilities,
    serverCapability: keyof proto.FileOperationOptions,
    accessUri: (i: I) => Uri,
    createParams: (e: Event<I>) => P,
  ) {
    super(client, event, requestType, clientCapability, serverCapability);
    this._requestType = requestType;
    this._accessUri = accessUri;
    this._createParams = createParams;
  }

  public async send(originalEvent: E & RequestEvent<I>): Promise<void> {
    const waitUntil = this.waitUntil(originalEvent);
    originalEvent.waitUntil(waitUntil);
  }

  private async waitUntil(originalEvent: E): Promise<WorkspaceEdit | null | undefined> {
    // Create a copy of the event that has the files filtered to match what the
    // server wants.
    const filteredEvent = await this.filter(originalEvent, this._accessUri);

    if (filteredEvent.files.length) {
      const next = (event: RequestEvent<I>): Promise<WorkspaceEdit | any> => {
        return this._client
          .sendRequest(this._requestType, this._createParams(event), event.token)
          .then(this._client.protocol2CodeConverter.asWorkspaceEdit);
      };
      return this.doSend(filteredEvent, next);
    } else {
      return undefined;
    }
  }

  protected abstract doSend(
    event: E,
    next: (event: RequestEvent<I>) => Thenable<WorkspaceEdit> | Thenable<any>,
  ): Thenable<WorkspaceEdit> | Thenable<any>;
}

export class WillCreateFilesFeature extends RequestFileOperationFeature<
  Uri,
  FileWillCreateEvent,
  proto.CreateFilesParams
> {
  constructor(client: FeatureClient<FileOperationsWorkspaceMiddleware>) {
    super(
      client,
      workspace.onWillCreateFiles,
      proto.WillCreateFilesRequest.type,
      'willCreate',
      'willCreate',
      (i: Uri) => i,
      client.code2ProtocolConverter.asWillCreateFilesParams,
    );
  }

  protected doSend(
    event: FileWillCreateEvent,
    next: (event: FileWillCreateEvent) => Thenable<WorkspaceEdit> | Thenable<any>,
  ): Thenable<WorkspaceEdit> | Thenable<any> {
    const middleware = this._client.middleware.workspace;
    return middleware?.willCreateFiles
      ? middleware.willCreateFiles(event, next)
      : next(event);
  }
}

export class WillRenameFilesFeature extends RequestFileOperationFeature<
  { oldUri: Uri; newUri: Uri },
  FileWillRenameEvent,
  proto.RenameFilesParams
> {
  constructor(client: FeatureClient<FileOperationsWorkspaceMiddleware>) {
    super(
      client,
      workspace.onWillRenameFiles,
      proto.WillRenameFilesRequest.type,
      'willRename',
      'willRename',
      (i: { oldUri: Uri; newUri: Uri }) => i.oldUri,
      client.code2ProtocolConverter.asWillRenameFilesParams,
    );
  }

  protected doSend(
    event: FileWillRenameEvent,
    next: (event: FileWillRenameEvent) => Thenable<WorkspaceEdit> | Thenable<any>,
  ): Thenable<WorkspaceEdit> | Thenable<any> {
    const middleware = this._client.middleware.workspace;
    return middleware?.willRenameFiles
      ? middleware.willRenameFiles(event, next)
      : next(event);
  }
}

export class WillDeleteFilesFeature extends RequestFileOperationFeature<
  Uri,
  FileWillDeleteEvent,
  proto.DeleteFilesParams
> {
  constructor(client: FeatureClient<FileOperationsWorkspaceMiddleware>) {
    super(
      client,
      workspace.onWillDeleteFiles,
      proto.WillDeleteFilesRequest.type,
      'willDelete',
      'willDelete',
      (i: Uri) => i,
      client.code2ProtocolConverter.asWillDeleteFilesParams,
    );
  }

  protected doSend(
    event: FileWillDeleteEvent,
    next: (event: FileWillDeleteEvent) => Thenable<WorkspaceEdit> | Thenable<any>,
  ): Thenable<WorkspaceEdit> | Thenable<any> {
    const middleware = this._client.middleware.workspace;
    return middleware?.willDeleteFiles
      ? middleware.willDeleteFiles(event, next)
      : next(event);
  }
}
