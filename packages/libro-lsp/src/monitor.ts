import { Emitter } from '@difizen/libro-common/mana-app';
import { singleton } from '@difizen/libro-common/mana-app';

import type { IMessageLog, MessageKind } from './lsp-protocol.js';

export interface LogMessage {
  /**
   * Identifier of the language server
   */
  serverIdentifier: string;

  /**
   * Language of the language server
   */
  serverLanguage: string;
  kind: MessageKind;
  message: IMessageLog;
}

@singleton()
export class LSPMonitor {
  protected onMessageEmitter = new Emitter<LogMessage>();
  onMessage = this.onMessageEmitter.event;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  log(message: LogMessage) {
    this.onMessageEmitter.fire(message);
  }
}
