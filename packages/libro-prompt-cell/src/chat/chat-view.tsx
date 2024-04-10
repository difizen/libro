import type { CellView, LibroView } from '@difizen/libro-core';
import { LirboContextKey } from '@difizen/libro-core';
import { useSize } from '@difizen/libro-core';
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
import { forwardRef, useRef } from 'react';

import { ChatHandler } from './chat-handler.js';
import type { IChatObject } from './chat-protocol.js';
import { ChatViewCache } from './chat-view-cache.js';
import { Chat } from './components/chat.js';
import './index.less';

interface ChatComponentProps {
  className?: string;
}
export const ChatComponent = forwardRef<HTMLDivElement>(function ChatComponent(
  props: ChatComponentProps,
  ref,
) {
  const contentRef = useRef<HTMLDivElement>(null);
  const instance = useInject<ChatView>(ViewInstance);
  const contentSize = useSize(contentRef);
  let containerStyle: React.CSSProperties = { width: 0 };
  if (instance.visible && contentSize) {
    if (contentSize) {
      containerStyle = {
        width: contentSize.width,
        height: contentSize.height,
      };
    }
  }
  return (
    <div className="libro-chat-view" style={containerStyle} ref={ref}>
      <div
        style={{ display: instance.visible ? 'block' : 'none' }}
        ref={contentRef}
        className="libro-chat-view-content"
      >
        {instance.parent && <Chat></Chat>}
      </div>
    </div>
  );
});

@view('libro-chat-view')
@transient()
export class ChatView extends BaseView {
  parent?: LibroView;

  @inject(ChatHandler) chatDataModel: ChatHandler;
  @inject(ChatViewCache) viewCache: ChatViewCache;
  @inject(LirboContextKey) libroContextKey: LirboContextKey;

  @prop()
  visible = false;
  @prop()
  cell?: CellView;

  // TODO: Chat objects and chat message records should belong to libro rather than cell
  @prop()
  contextChatObjects: IChatObject[] = [];

  @prop()
  contextChatRecords: string[] = [];

  override view = ChatComponent;

  override onViewMount(): void {
    super.onViewMount?.();
    this.libroContextKey.base.set(false);
  }

  override onViewUnmount(): void {
    super.onViewUnmount?.();
    this.libroContextKey.base.set(true);
  }

  @postConstruct()
  async init() {
    //
  }

  get record() {
    if (!this.cell) {
      return undefined;
    }
  }

  open = () => {
    this.visible = true;
  };

  close = () => {
    this.visible = false;
    this.cell = undefined;
  };

  toggle = (cell?: CellView) => {
    if (this.visible) {
      if (this.cell?.id !== cell?.id) {
        this.cell = cell;
        return;
      }
      this.close();
    } else {
      this.cell = cell;
      this.open();
    }
  };

  override dispose(): void {
    super.dispose();
    this.visible = false;
    this.cell = undefined;
  }

  hide = () => {
    this.visible = false;
  };
}
