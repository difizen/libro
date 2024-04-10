import { Avatar, Button } from 'antd';
import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import { MessageStatus, cls } from '../../common';
import Icon from '../Icon';
import Typing from '../Typing';

import useStyle from './style';

export interface MessageBaseProps {
  /** 消息展示方向 */
  direction?: 'left' | 'right';
  /** 头像 */
  avatar?: string;
  /** 消息操作 */
  actions?: ReactNode;
  /** 消息底部 */
  footer?: ReactNode;
  /** 消息顶部 */
  header?: ReactNode;
  /**
   * 消息状态, 仅在左侧消息生效，如果是 `success` | error | loading ，将使用内置状态，
   * 默认 success, 没有渲染，
   * 除以上状态视为自定义节点
   * @default success
   */
  status?: ReactNode;
  /** 消息体 */
  children?: ReactNode;
  /** 输入中 */
  typing?: boolean;
  /** 消息ID */
  id?: string;
  /** 消息类型，在图片类型 img 时，取消消息边距padding、背景、box-shadow */
  type?: string;
}

const MessageBase: React.FunctionComponent<MessageBaseProps> = (props) => {
  const {
    direction = 'left',
    avatar,
    actions,
    footer,
    header,
    status = 'success',
    children,
    id,
    typing,
  } = props;

  const flexFlowStyle = {
    flexFlow: direction !== 'left' ? 'row-reverse' : 'row',
  };

  const styles = useStyle(props);

  const [msgId] = useState(() => id || new Date().valueOf());

  const typingDomId = `typing-${msgId}`;

  /** 请勿轻易改动，用于typing展示，及外部copyText 定位 */
  const msgContentDomId = `content-${msgId}`;

  /** 取到一个有效的末位节点的父节点 */
  function findParentOfLastElement(node: HTMLElement | ChildNode | null): any {
    if (node === null) {
      return node;
    }

    if (!node.hasChildNodes()) {
      return node.parentNode;
    }

    const chi = node.childNodes || [];

    for (let i = chi.length - 1; i >= 0; i--) {
      const text = (chi[i]?.textContent as string).replace(/\s*/, '').trim();

      if (text) {
        return findParentOfLastElement(chi[i]);
      }
    }
    return node;
  }

  function creatTypingDom() {
    let typingDom = document.getElementById(typingDomId);

    if (typingDom) {
      typingDom.remove();
    }

    typingDom = document.createElement('span');
    typingDom.id = typingDomId;

    return typingDom;
  }

  function addTyping() {
    if (!typing) {
      document.getElementById(typingDomId)?.remove();
      return;
    }

    const lastChildren = findParentOfLastElement(
      document.getElementById(msgContentDomId),
    );

    if (lastChildren && lastChildren.id !== typingDomId) {
      const dom = lastChildren.appendChild(creatTypingDom());

      if (ReactDOM.createRoot) {
        ReactDOM.createRoot(dom)?.render(
          <Typing color={lastChildren?.tagName === 'CODE' ? '#fff' : ''} />,
        );
      } else {
        // @ts-ignore
        // eslint-disable-next-line react/no-deprecated
        ReactDOM.render(
          <Typing color={lastChildren?.tagName === 'CODE' ? '#fff' : ''} />,
          dom,
        );
      }
    }
  }

  useEffect(addTyping, [typing, children]);

  function renderAvatar() {
    if (avatar === undefined) {
      return null;
    }

    return (
      <div className={`${styles.message}__avatar`}>
        <Avatar style={{ background: 'transparent' }} src={avatar}>
          {}
        </Avatar>
      </div>
    );
  }

  function renderMsgHeader() {
    if (header === undefined) {
      return null;
    }

    return (
      <div className={`${styles.message}__content__header`} style={flexFlowStyle}>
        {header}
      </div>
    );
  }

  function renderMsgFooter() {
    if (footer === undefined) {
      return null;
    }

    return (
      <div className={`${styles.message}__content__footer`} style={flexFlowStyle}>
        {footer}
      </div>
    );
  }

  function renderMsgStatus() {
    if (direction !== 'left' || !status) {
      return null;
    }

    if (status === MessageStatus.error) {
      return (
        <div className={`${styles.message}__content__main__status`}>
          <Button
            style={{ pointerEvents: 'none' }}
            type="text"
            disabled
            icon={<Icon type="icon-close-circle-outlined" size={20} />}
          ></Button>
        </div>
      );
    }
    if (status === MessageStatus.loading) {
      return (
        <div className={`${styles.message}__content__main__status`}>
          <Button
            style={{ pointerEvents: 'none' }}
            type="text"
            loading
            // icon={<Icon loading type='icon-loading-outlined'/>}
          ></Button>
        </div>
      );
    }
    if (status === MessageStatus.success) {
      return null;
    }

    return status;
  }

  function renderMsgMain() {
    return (
      <div className={`${styles.message}__content__main content__main`}>
        <div id={msgContentDomId}>{children}</div>
        {actions && <div className={'message_content_main_actions'}>{actions}</div>}
        {renderMsgStatus()}
      </div>
    );
  }

  return (
    <div className={styles.message} style={flexFlowStyle}>
      {renderAvatar()}
      <div className={`${styles.message}__content ${cls('content')}`}>
        {renderMsgHeader()}
        {renderMsgMain()}
        {renderMsgFooter()}
      </div>
    </div>
  );
};

export default MessageBase;
