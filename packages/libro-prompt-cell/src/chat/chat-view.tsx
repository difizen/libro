import type { CellView, LibroView } from '@difizen/libro-core';
import {
  BaseView,
  inject,
  postConstruct,
  prop,
  transient,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { Modal } from 'antd';
import { forwardRef } from 'react';

import { ChatHandler } from './chat-handler.js';
import type { ChatObject } from './chat-protocol.js';

interface ChatComponentProps {
  className?: string;
}
export const ChatComponent = forwardRef<HTMLDivElement>(function ChatComponent(
  props: ChatComponentProps,
  ref,
) {
  const instance = useInject<ChatView>(ViewInstance);
  if (!instance.visible) {
    return null;
  }
  return (
    <Modal open={instance.visible} onCancel={instance.hide}>
      <div ref={ref}>ChatComponent</div>
    </Modal>
  );
});

@view('libro-chat')
@transient()
export class ChatView extends BaseView {
  parent?: LibroView;

  @inject(ChatHandler) chatDataModel: ChatHandler;

  @prop()
  visible = false;
  @prop()
  cell?: CellView;

  // TODO: Chat objects and chat message records should belong to libro rather than cell
  @prop()
  contextChatObjects: ChatObject[] = [];

  @prop()
  contextChatRecords: string[] = [];

  override view = ChatComponent;

  @postConstruct()
  async init() {
    await this.chatDataModel.onChatModalVisibleChange(
      ({ visible, libroId, cellId }) => {
        if (this.parent?.id !== libroId) {
          return;
        }
        this.visible = visible;
        this.cell = this.parent.model.cells.find((cell) => cell.id === cellId);
      },
    );
  }

  hide = () => {
    this.visible = false;
  };
}
