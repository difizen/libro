import type { IKernelConnection, KernelMessage } from '@difizen/libro-jupyter';
import { Deferred, Emitter, inject, singleton } from '@difizen/mana-app';

import type { ChatObject } from './chat-protocol.js';
import { ChatScript } from './chat-scripts.js';

@singleton()
export class ChatHandler {
  @inject(ChatScript) chatScript: ChatScript;

  enable = false;

  protected onChatModalVisibleChangeEmitter = new Emitter<{
    visible: boolean;
    libroId: string;
    cellId?: string;
  }>();

  get onChatModalVisibleChange() {
    return this.onChatModalVisibleChangeEmitter.event;
  }

  openChat(libroId: string, cellId?: string) {
    this.onChatModalVisibleChangeEmitter.fire({ visible: true, libroId, cellId });
  }
  closeChat(libroId: string, cellId?: string) {
    this.onChatModalVisibleChangeEmitter.fire({ visible: false, libroId, cellId });
  }

  getChatObjects = async (connection: IKernelConnection) => {
    const deferred = new Deferred<ChatObject[]>();
    this.fetch(
      connection,
      {
        code: this.chatScript.getChatObjects,
        store_history: false,
      },
      (msg) =>
        this.handleQueryResponse(msg, (result) => {
          try {
            let chatObjects = JSON.parse(result) as ChatObject[];
            chatObjects = chatObjects.map((item) => ({
              ...item,
              disabled: false,
            }));
            deferred.resolve(chatObjects);
          } catch (e) {
            //
          }
        }),
    );
    return deferred.promise;
  };

  getChatRecordNames = async (connection: IKernelConnection) => {
    const deferred = new Deferred<string[]>();
    this.fetch(
      connection,
      {
        code: this.chatScript.getChatRecoreds,
        store_history: false,
      },
      (msg) =>
        this.handleQueryResponse(msg, (result) => {
          try {
            const contextChatRecords = JSON.parse(result) as string[];
            deferred.resolve(contextChatRecords);
          } catch (e) {
            //
          }
        }),
    );
    return deferred.promise;
  };

  fetch = async (
    connection: IKernelConnection,
    content: KernelMessage.IExecuteRequestMsg['content'],
    ioCallback: (msg: KernelMessage.IIOPubMessage) => any,
  ) => {
    const future = connection.requestExecute(content);
    future.onIOPub = (msg) => {
      ioCallback(msg);
    };
    return future.done as Promise<KernelMessage.IExecuteReplyMsg>;
  };

  handleQueryResponse = (
    response: KernelMessage.IIOPubMessage,
    cb: (result: string) => void,
  ) => {
    const msgType = response.header.msg_type;
    switch (msgType) {
      case 'execute_result':
      case 'display_data': {
        const payload = response as KernelMessage.IExecuteResultMsg;
        let content: string = payload.content.data['text/plain'] as string;
        if (content.slice(0, 1) === "'" || content.slice(0, 1) === '"') {
          content = content.slice(1, -1);
          content = content.replace(/\\"/g, '"').replace(/\\'/g, "'");
        }

        cb(content);
        break;
      }
      case 'stream': {
        const payloadDisplay = response as KernelMessage.IStreamMsg;
        let contentStream: string = payloadDisplay.content.text as string;
        if (contentStream.slice(0, 1) === "'" || contentStream.slice(0, 1) === '"') {
          contentStream = contentStream.slice(1, -1);
          contentStream = contentStream.replace(/\\"/g, '"').replace(/\\'/g, "'");
        }
        cb(contentStream);
        break;
      }
      default:
        break;
    }
  };
}
