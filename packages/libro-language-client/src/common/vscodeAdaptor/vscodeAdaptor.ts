import { Emitter } from '@difizen/libro-common/common';
import type { Syringe } from '@difizen/libro-common/app';
import * as monaco from '@difizen/monaco-editor-core';
import type { Disposable } from 'vscode';
import { URI } from 'vscode-uri';

import { ILibroWindow, ILibroWorkspace, IMonacoLanguages } from './services.js';

export const CompletionItemTag = monaco.languages.CompletionItemTag;
export type CompletionItemTag = monaco.languages.CompletionItemTag;
export const SignatureHelpTriggerKind = monaco.languages.SignatureHelpTriggerKind;
export type SignatureHelpTriggerKind = monaco.languages.SignatureHelpTriggerKind;
export const CompletionTriggerKind = monaco.languages.CompletionTriggerKind;
export type CompletionTriggerKind = monaco.languages.CompletionTriggerKind;

export const lspEnv: {
  libroContainer: Syringe.Container;
} = {
  libroContainer: {} as Syringe.Container,
};

export let workspace: ILibroWorkspace = undefined as any;
export let window: ILibroWindow = undefined as any;
export let languages: IMonacoLanguages = undefined as any;

export const setupLspEnv = (container: Syringe.Container) => {
  lspEnv.libroContainer = container;
};

export const initLspEnv = () => {
  workspace = lspEnv.libroContainer.get(ILibroWorkspace);
  window = lspEnv.libroContainer.get(ILibroWindow);
  languages = lspEnv.libroContainer.get(IMonacoLanguages);
};

export class Uri extends URI {}

export const version = '1.85.1';

class VscodeEnv {
  language = 'python';
  appName = 'libro';
  openExternal(target: Uri): Thenable<boolean> {
    return Promise.resolve(true);
  }
}

export const env = new VscodeEnv();

export class CancellationTokenSource extends monaco.CancellationTokenSource {}

const canceledName = 'Canceled';
export class CancellationError extends Error {
  constructor() {
    super(canceledName);
    this.name = this.message;
  }
}

class Commands {
  registerCommand(
    command: string,
    callback: (...args: any[]) => any,
    thisArg?: any,
  ): Disposable {
    return {
      dispose() {
        return;
      },
    };
  }
}

export const commands = new Commands();

export { Emitter as EventEmitter };

export class TabInputText {
  constructor(readonly uri: Uri) {}
}

export class TabInputTextDiff {
  constructor(
    readonly original: Uri,
    readonly modified: Uri,
  ) {}
}

export class TabInputCustom {
  constructor(
    readonly uri: Uri,
    readonly viewType: string,
  ) {}
}

export enum FileType {
  /**
   * File is unknown (neither file, directory nor symbolic link).
   */
  Unknown = 0,

  /**
   * File is a normal file.
   */
  File = 1,

  /**
   * File is a directory.
   */
  Directory = 2,

  /**
   * File is a symbolic link.
   *
   * Note: even when the file is a symbolic link, you can test for
   * `FileType.File` and `FileType.Directory` to know the type of
   * the target the link points to.
   */
  SymbolicLink = 64,
}

export * from './extHostTypes.js';
