/* eslint-disable no-console */
import { noop, singleton } from '@difizen/libro-common/app';
import type {
  TabGroups,
  TextEditor,
  Event,
  OutputChannel,
  TextDocument,
  Uri,
  ProgressOptions,
  Progress,
  ViewColumn,
  TextDocumentShowOptions,
  CancellationToken,
} from 'vscode';

import type { MsgFunc } from './services.js';
import { ILibroWindow } from './services.js';
import { unsupported } from './util.js';

@singleton({ token: ILibroWindow })
export class LibroWindow implements ILibroWindow {
  protected readonly channels = new Map<string, OutputChannel>();

  tabGroups: TabGroups;
  activeTextEditor: TextEditor | undefined;
  onDidChangeActiveTextEditor: Event<TextEditor | undefined> = () => {
    return {
      dispose: () => {
        return;
      },
    };
  };
  createOutputChannel(name: string, options?: string | { log: true }): OutputChannel {
    const existing = this.channels.get(name);
    if (existing) {
      return existing;
    }
    const channel: OutputChannel = {
      name,
      clear: unsupported,
      replace: unsupported,
      hide: unsupported,
      append(value: string): void {
        console.log(name + ': ' + value);
      },
      appendLine(line: string): void {
        console.log(name + ': ' + line);
      },
      show: noop,
      dispose: noop,
    };
    this.channels.set(name, channel);
    return channel;
  }
  showErrorMessage: MsgFunc = (message: string, ...items) => {
    console.error(message);
    return Promise.resolve(items[0]);
  };
  showWarningMessage: MsgFunc = (message: string, ...items) => {
    console.warn(message);
    return Promise.resolve(items[0]);
  };
  showInformationMessage: MsgFunc = (message: string, ...items) => {
    // eslint-disable-next-line no-console
    console.log(message);
    return Promise.resolve(items[0]);
  };
  showTextDocument(
    documentOrUri: TextDocument | Uri,
    columnOrOptions?: ViewColumn | TextDocumentShowOptions,
    preserveFocus?: boolean,
  ): Promise<TextEditor> {
    return Promise.resolve({} as TextEditor);
  }
  withProgress<R>(
    options: ProgressOptions,
    task: (
      progress: Progress<{ message?: string; worked?: number }>,
      token: CancellationToken,
    ) => Thenable<R>,
  ) {
    return Promise.resolve({} as R);
  }
}
