import { LibroService } from '@difizen/libro-core';
import { inject, singleton } from '@difizen/libro-common/app';
import type { Event, FileSystemWatcher, GlobPattern, Uri } from 'vscode';

import { EventEmitter } from './vscodeAdaptor.js';

@singleton()
export class LibroFileWatcher implements FileSystemWatcher {
  @inject(LibroService) protected readonly libroService: LibroService;

  create(
    globPattern: GlobPattern,
    ignoreCreateEvents?: boolean,
    ignoreChangeEvents?: boolean,
    ignoreDeleteEvents?: boolean,
  ) {
    this.globPattern = globPattern;
    this.ignoreCreateEvents = ignoreCreateEvents ?? true;
    this.ignoreChangeEvents = ignoreChangeEvents ?? true;
    this.ignoreDeleteEvents = ignoreDeleteEvents ?? true;
  }

  globPattern: GlobPattern;
  ignoreCreateEvents: boolean;
  ignoreChangeEvents: boolean;
  ignoreDeleteEvents: boolean;
  protected onDidCreateEmitter = new EventEmitter<Uri>();
  onDidCreate: Event<Uri> = this.onDidCreateEmitter.event;
  protected onDidChangeEmitter = new EventEmitter<Uri>();
  onDidChange: Event<Uri> = this.onDidChangeEmitter.event;
  protected onDidDeleteEmitter = new EventEmitter<Uri>();
  onDidDelete: Event<Uri> = this.onDidDeleteEmitter.event;
  dispose() {
    // console.log('Method not implemented.');
  }
}
