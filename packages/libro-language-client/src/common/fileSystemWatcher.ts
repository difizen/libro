/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import type {
  ClientCapabilities,
  DidChangeWatchedFilesRegistrationOptions,
  DocumentSelector,
  FileEvent,
  RegistrationType,
  ServerCapabilities,
} from '@difizen/vscode-languageserver-protocol';
import {
  DidChangeWatchedFilesNotification,
  FileChangeType,
  WatchKind,
} from '@difizen/vscode-languageserver-protocol';
import type { Disposable, FileSystemWatcher as VFileSystemWatcher } from 'vscode';

import type {
  FeatureClient,
  DynamicFeature,
  RegistrationData,
  FeatureState,
} from './features.js';
import { ensure } from './features.js';
import { workspace as Workspace } from './vscodeAdaptor/vscodeAdaptor.js';

export class FileSystemWatcherFeature
  implements DynamicFeature<DidChangeWatchedFilesRegistrationOptions>
{
  private readonly _client: FeatureClient<object>;
  private readonly _notifyFileEvent: (event: FileEvent) => void;
  private readonly _watchers: Map<string, Disposable[]>;

  constructor(
    client: FeatureClient<object>,
    notifyFileEvent: (event: FileEvent) => void,
  ) {
    this._client = client;
    this._notifyFileEvent = notifyFileEvent;
    this._watchers = new Map<string, Disposable[]>();
  }

  getState(): FeatureState {
    return {
      kind: 'workspace',
      id: this.registrationType.method,
      registrations: this._watchers.size > 0,
    };
  }

  public get registrationType(): RegistrationType<DidChangeWatchedFilesRegistrationOptions> {
    return DidChangeWatchedFilesNotification.type;
  }

  public fillClientCapabilities(capabilities: ClientCapabilities): void {
    ensure(
      ensure(capabilities, 'workspace')!,
      'didChangeWatchedFiles',
    )!.dynamicRegistration = true;
    ensure(
      ensure(capabilities, 'workspace')!,
      'didChangeWatchedFiles',
    )!.relativePatternSupport = true;
  }

  public initialize(
    _capabilities: ServerCapabilities,
    _documentSelector: DocumentSelector,
  ): void {
    return;
  }

  public register(
    data: RegistrationData<DidChangeWatchedFilesRegistrationOptions>,
  ): void {
    if (!Array.isArray(data.registerOptions.watchers)) {
      return;
    }
    const disposables: Disposable[] = [];
    for (const watcher of data.registerOptions.watchers) {
      const globPattern = this._client.protocol2CodeConverter.asGlobPattern(
        watcher.globPattern,
      );
      if (globPattern === undefined) {
        continue;
      }
      let watchCreate = true,
        watchChange = true,
        watchDelete = true;
      if (watcher.kind !== undefined && watcher.kind !== null) {
        watchCreate = (watcher.kind & WatchKind.Create) !== 0;
        watchChange = (watcher.kind & WatchKind.Change) !== 0;
        watchDelete = (watcher.kind & WatchKind.Delete) !== 0;
      }
      const fileSystemWatcher: VFileSystemWatcher = Workspace.createFileSystemWatcher(
        globPattern,
        !watchCreate,
        !watchChange,
        !watchDelete,
      );
      this.hookListeners(
        fileSystemWatcher,
        watchCreate,
        watchChange,
        watchDelete,
        disposables,
      );
      disposables.push(fileSystemWatcher);
    }
    this._watchers.set(data.id, disposables);
  }

  public registerRaw(id: string, fileSystemWatchers: VFileSystemWatcher[]) {
    const disposables: Disposable[] = [];
    for (const fileSystemWatcher of fileSystemWatchers) {
      this.hookListeners(fileSystemWatcher, true, true, true, disposables);
    }
    this._watchers.set(id, disposables);
  }

  private hookListeners(
    fileSystemWatcher: VFileSystemWatcher,
    watchCreate: boolean,
    watchChange: boolean,
    watchDelete: boolean,
    listeners?: Disposable[],
  ): void {
    if (watchCreate) {
      fileSystemWatcher.onDidCreate(
        (resource) =>
          this._notifyFileEvent({
            uri: this._client.code2ProtocolConverter.asUri(resource),
            type: FileChangeType.Created,
          }),
        null,
        listeners,
      );
    }
    if (watchChange) {
      fileSystemWatcher.onDidChange(
        (resource) =>
          this._notifyFileEvent({
            uri: this._client.code2ProtocolConverter.asUri(resource),
            type: FileChangeType.Changed,
          }),
        null,
        listeners,
      );
    }
    if (watchDelete) {
      fileSystemWatcher.onDidDelete(
        (resource) =>
          this._notifyFileEvent({
            uri: this._client.code2ProtocolConverter.asUri(resource),
            type: FileChangeType.Deleted,
          }),
        null,
        listeners,
      );
    }
  }

  public unregister(id: string): void {
    const disposables = this._watchers.get(id);
    if (disposables) {
      this._watchers.delete(id);
      for (const disposable of disposables) {
        disposable.dispose();
      }
    }
  }

  public clear(): void {
    this._watchers.forEach((disposables) => {
      for (const disposable of disposables) {
        disposable.dispose();
      }
    });
    this._watchers.clear();
  }
}
