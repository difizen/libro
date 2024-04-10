import type { LibroView } from '@difizen/libro-core';
import classnames from 'classnames';

import type { LibroPromptCellView } from '../../prompt-cell-view.js';

import { Input } from './input/index.js';
import './index.less';

export interface ChatProps {
  className?: string;
}
export function Chat(props: ChatProps) {
  const { className } = props;
  return (
    <div className={classnames('libro-chat', className)}>
      <div className="libro-chat-content">
        <div className="libro-chat-content-header">
          <div className="libro-chat-content-header-title">Chat</div>
        </div>
        <div className="libro-chat-content-list"></div>
        <Input wrapperClassName="libro-chat-content-input" />
      </div>
    </div>
  );
}
