import type { DisplayView, LibroView } from '@difizen/libro-jupyter';
import type { ConfigurationService } from '@difizen/mana-app';
import { BaseView, prop, transient, view } from '@difizen/mana-app';
import { useRef } from 'react';

export const ChatRender = () => {
  const containRef = useRef<HTMLDivElement>(null);
  return (
    <div className="chat-container" ref={containRef}>
      chat
    </div>
  );
};

@transient()
@view('libro-chat-view')
export class ChatView extends BaseView implements DisplayView {
  parent: LibroView | undefined = undefined;
  protected configurationService: ConfigurationService;

  override view = ChatRender;

  @prop()
  isDisplay = true;
}
