import type {
  CellView,
  IKernelConnection,
  KernelMessage,
  LibroView,
} from '@difizen/libro-jupyter';
import { Deferred, inject, prop, singleton } from '@difizen/mana-app';

import type { IChatObject, IChatChannel } from './chat-protocol.js';
import { ChatChannelFactory } from './chat-protocol.js';
import { ChatScript } from './chat-scripts.js';
import { ChatViewCache } from './chat-view-cache.js';

@singleton()
export class ChatHandler {
  @inject(ChatScript) chatScript: ChatScript;
  @inject(ChatViewCache) viewCache: ChatViewCache;

  enable = false;

  @inject(ChatChannelFactory) channelFactory: () => IChatChannel;

  @prop()
  channelMaps: Map<string, IChatChannel> = new Map();

  createNewChannel(): IChatChannel {
    return this.channelFactory();
  }

  getChannel(key: string): IChatChannel {
    let channel = this.channelMaps.get(key);
    if (!channel) {
      channel = this.createNewChannel();
      this.channelMaps.set(key, channel);
    }
    return channel;
  }

  toggleChat(libro: LibroView, cell?: CellView) {
    const chatView = this.viewCache.getView(libro.id);
    if (chatView) {
      chatView.toggle(cell);
    }
  }

  getChatObjects = async (connection: IKernelConnection) => {
    const deferred = new Deferred<IChatObject[]>();
    this.fetch(
      connection,
      {
        code: this.chatScript.getChatObjects,
        store_history: false,
      },
      (msg) =>
        this.handleQueryResponse(msg, (result) => {
          try {
            let chatObjects = JSON.parse(result) as IChatObject[];
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
