import { EditFilled } from '@ant-design/icons';
import { LirboContextKey } from '@difizen/libro-core';
import { useInject } from '@difizen/mana-app';
import { Select, Tag } from 'antd';
import classNames from 'classnames';
import type { BaseSelectRef } from 'rc-select';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import './index.less';

interface ChatRecordInputProps {
  value: string;
  handleChange: (value: string) => void;
  onFocus?: () => void;
  classname?: string;
  records: string[];
}
const ChatRecordInputCls = 'libro-chat-record-input';
export const ChatRecordInput: FC<ChatRecordInputProps> = (
  props: ChatRecordInputProps,
) => {
  const { value, records, handleChange, onFocus } = props;
  const selectRef = useRef<BaseSelectRef>(null);
  const [selecting, setSelecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const contextKey = useInject(LirboContextKey);

  useEffect(() => {
    if (selecting) {
      selectRef.current?.focus();
    }
  }, [selecting]);

  const handleSelecting = (value: boolean) => {
    if (value) {
      contextKey.disableCommandMode();
    } else {
      contextKey.enableCommandMode();
    }
    setSelecting(value);
  };

  return (
    <div
      className={classNames(ChatRecordInputCls, props.classname)}
      ref={ref}
      tabIndex={0}
    >
      <span className="libro-chat-record-input-label">Chat: </span>
      {selecting ? (
        <Select
          ref={selectRef}
          className="libro-chat-record-input-select"
          size="small"
          mode="tags"
          style={{ width: '100%' }}
          placeholder="选择或输入聊天标识"
          onSelect={handleChange}
          showSearch={false}
          onBlur={() => {
            handleSelecting(false);
          }}
          onFocus={() => {
            if (onFocus) {
              onFocus();
            }
          }}
          options={
            records.map((record) => ({
              label: record,
              value: record,
            })) || []
          }
        />
      ) : (
        <>
          <span className="libro-chat-record-input-value">
            {value ? <Tag>{value}</Tag> : '...'}
          </span>
          <span
            onClick={() => {
              handleSelecting(true);
            }}
          >
            <EditFilled />
          </span>
        </>
      )}
    </div>
  );
};