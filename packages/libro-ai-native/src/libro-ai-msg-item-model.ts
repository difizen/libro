import { AnswerState, ChatEvent } from '@difizen/magent-chat';
import type {
  IChatMessageSender,
  ErrorMessage,
  IChatEvent,
  ChatEventChunk,
  ChatEventError,
  ChatEventResult,
  IChatMessageItem,
} from '@difizen/magent-chat';
import { autoFactory, AutoFactoryOption } from '@difizen/magent-core';
import { inject, prop } from '@difizen/mana-app';

@autoFactory()
export class LibroAIChatMessageItemModel {
  id?: string;
  sender: IChatMessageSender;

  @prop()
  state: AnswerState;

  @prop()
  protected _content = '';
  get content(): string {
    return this._content;
  }
  set content(v) {
    this._content = v;
  }

  option: IChatMessageItem;

  @prop()
  error?: ErrorMessage;

  constructor(@inject(AutoFactoryOption) option: IChatMessageItem) {
    if (option.content) {
      this.state = AnswerState.SUCCESS;
    } else {
      this.state = AnswerState.WAITING;
    }
  }

  handleEventData(e: IChatEvent) {
    if (ChatEvent.isChunk(e)) {
      this.appendChunk(e);
    }
    if (ChatEvent.isError(e)) {
      this.handleError(e);
    }
    if (ChatEvent.isResult(e)) {
      this.handleResult(e);
    }
  }

  appendChunk(e: ChatEventChunk) {
    this.content = `${this.content}${e.output}`;
  }

  handleResult(e: ChatEventResult) {
    this.content = e.output;
    this.state = AnswerState.SUCCESS;
  }

  handleError(e: ChatEventError) {
    this.error = { message: e.message };
  }
}
