import { singleton } from '@difizen/libro-common/app';
import type { IChatEvent, IChatMessageItem } from '@difizen/magent-chat';
import { ChatEvent } from '@difizen/magent-chat';
import { LibroChatService } from '@difizen/magent-libro';
import type { ParsedEvent } from 'eventsource-parser/stream';
import { EventSourceParserStream } from 'eventsource-parser/stream';

import type { LibroAINativeChatMessageItemOption } from './protocol.js';
import { stringToReadableStream } from './utils.js';

@singleton()
export class LibroAINativeChatService extends LibroChatService {
  override chat = async (
    option: LibroAINativeChatMessageItemOption,
  ): Promise<IChatMessageItem[]> => {
    const { content, system_prompt } = option;
    const res = await this.fetcher.post<any>(`/libro/api/chat`, {
      prompt: encodeURIComponent(content),
      system_prompt,
    });

    if (res.status === 200) {
      if (res.data.output) {
        return [
          {
            sender: { type: 'AI', id: 'libro' },
            content: res.data.output,
          },
        ];
      }
    }
    return [];
  };
  override chatStream = async (
    option: LibroAINativeChatMessageItemOption,
    messgeCallback: (event: IChatMessageItem) => void,
    eventCallback: (event: IChatEvent) => void,
  ) => {
    const { content, system_prompt } = option;

    const url = `/libro/api/chatstream`;
    const msg = {
      prompt: encodeURIComponent(content),
      system_prompt,
    };
    const res = await this.fetcher.post<ReadableStream<Uint8Array>>(url, msg, {
      headers: {
        Accept: 'text/event-stream',
      },
      responseType: 'stream',
      adapter: 'fetch',
    });
    if (res.status === 200) {
      let reader;
      if (typeof res.data === 'string') {
        reader = stringToReadableStream(res.data)
          .pipeThrough(new TextDecoderStream())
          .pipeThrough(new EventSourceParserStream())
          .getReader();
      } else {
        const stream = res.data;
        reader = stream
          .pipeThrough(new TextDecoderStream())
          .pipeThrough(new EventSourceParserStream())
          .getReader();
      }

      messgeCallback({
        sender: { type: 'AI', id: 'libro' },
        content: '',
      });
      let alreayDone = false;
      let error: ParsedEvent = { data: '', type: 'event' };
      try {
        while (!alreayDone) {
          const { value, done } = await reader.read();
          if (done) {
            alreayDone = true;
            eventCallback({
              type: 'done',
            });

            break;
          }
          if (value) {
            error = value;
          }
          const data = JSON.parse(value.data);
          const event = ChatEvent.format(value.event || 'chunk', data);
          eventCallback(event);
        }
      } catch {
        console.error('libro-ai-error:' + error.data);
        eventCallback({
          type: 'error',
          message: error.data,
        });
      }
      return;
    }
  };
}
