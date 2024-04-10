import { SendOutlined } from '@ant-design/icons';
import { Button, Input as AntdInput } from 'antd';
import type { TextAreaRef } from 'antd/es/input/TextArea.js';
import classnames from 'classnames';
import type { ChangeEvent, ReactNode, KeyboardEvent, FC } from 'react';
import { forwardRef, useMemo } from 'react';
import './index.less';

function insertAtCaret(e: ChangeEvent<HTMLTextAreaElement>, valueToInsert?: string) {
  const target = e.target;

  const start = target.selectionStart;
  const end = target.selectionEnd;
  const newValue =
    target.value.slice(0, start) + valueToInsert + target.value.slice(end);

  e.target.value = newValue;
  e.target.selectionStart = start + 1;
  e.target.selectionEnd = end + 1;

  const lineHeight = parseInt(getComputedStyle(target).lineHeight);
  const linesCount = newValue.substring(0, start + 1).split('\n').length;
  const newLineTop = linesCount * lineHeight;
  const visibleBottom = target.scrollTop + target.clientHeight;

  if (newLineTop > visibleBottom) {
    e.target.scrollTop = newLineTop - target.clientHeight;
  }

  return e;
}

export interface InputProps {
  prefixCls?: string;
  /** 提示信息 */
  tips?: ReactNode;
  /**
   * tips 位置
   * @default top
   */
  tipsPosition?: 'top' | 'bottom';
  /** 最外层容器 className */
  wrapperClassName?: string;
  /**
   * enter时，是否直接发送消息, 若配置为true，换行时请使用 Command 键（⌘）+ enter 或者 Windows 键（⊞）+ enter。
   * @default false
   */
  isEnterSend?: boolean;
  /**
   * isEnterSend 为 true 时，用于直接提交
   */
  onSubmit?: (value: string) => void;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  sendEnable?: boolean;
  sending?: boolean;
  value?: string;
}

/** @deprecated 仅用于 API 文档说明 */
export const DOCS_API_INPUT_PROPS: FC<InputProps> = () => null;

export const Input = forwardRef<TextAreaRef, InputProps>(function Input(
  porps: InputProps,
  ref,
) {
  const {
    prefixCls = 'libro-chat-input',
    tips,
    wrapperClassName = '',
    tipsPosition = 'top',
    sendEnable = true,
    sending = false,
    isEnterSend = false,
    onChange,
    onKeyDown,
    onSubmit,
    value,
    ...textAreaProps
  } = porps;

  // fix tips: '/' =>> ''
  const open = useMemo(() => {
    if (value === '') {
      return false;
    }

    return !!tips;
  }, [tips, value]);

  function onInputChange(e: ChangeEvent<HTMLTextAreaElement>) {
    onChange?.(e);
  }

  function onInputKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    e.persist();
    const { metaKey, ctrlKey, altKey, keyCode } = e;

    if (keyCode === 13) {
      if (open) {
        e.preventDefault();
      } else if (isEnterSend && (metaKey || ctrlKey || altKey)) {
        const event = insertAtCaret(
          e as unknown as ChangeEvent<HTMLTextAreaElement>,
          '\n',
        );
        setTimeout(() => onInputChange(event), 0);
      } else if (isEnterSend) {
        e.preventDefault();
        if (sendEnable) {
          setTimeout(() => onSubmit?.(e.currentTarget.value), 0);
        }
      }
    }
    onKeyDown?.(e);
  }

  return (
    <div className={classnames(prefixCls, wrapperClassName)}>
      <div className={`${prefixCls}-content`}>
        <div style={{ display: 'flex', alignItems: 'center', minHeight: '46px' }}>
          <AntdInput.TextArea
            placeholder="Type a message..."
            ref={ref}
            value={value}
            onChange={onInputChange}
            onKeyDown={onInputKeyDown}
            bordered={false}
            className={`${prefixCls}-textarea`}
            autoSize={{ minRows: 1, maxRows: 8 }}
          />
        </div>
        <div className={`${prefixCls}-operation`}>
          <div className={`${prefixCls}-operation-send`}>
            <Button
              className={`${prefixCls}-textarea-btn`}
              type="primary"
              icon={<SendOutlined />}
            ></Button>
          </div>
        </div>
      </div>
    </div>
  );
});
