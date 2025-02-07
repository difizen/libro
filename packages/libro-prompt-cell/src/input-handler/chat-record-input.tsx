import { EditFilled } from '@ant-design/icons';
import { LibroContextKey } from '@difizen/libro-core';
import { useInject } from '@difizen/mana-app';
import { l10n } from '@difizen/libro-common/mana-l10n';
import { Select, Tag } from 'antd';
import classNames from 'classnames';
import type { BaseSelectRef } from 'rc-select';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import './index.less';

interface ChatRecordInputProps {
  value: string | undefined;
  handleChange: (value: string | undefined) => void;
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
  const contextKey = useInject(LibroContextKey);

  useEffect(() => {
    if (selecting) {
      selectRef.current?.focus();
    }
  }, [selecting]);

  const handleSelecting = (v: boolean) => {
    if (v) {
      contextKey.disableCommandMode();
    } else {
      contextKey.enableCommandMode();
    }
    setSelecting(v);
  };

  const handleSelectChange = (arr: string | string[]) => {
    if (arr instanceof Array) {
      handleChange(arr[0]);
    }
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
          placeholder={l10n.t('选择或输入聊天标识')}
          onSelect={handleSelectChange}
          onChange={handleSelectChange}
          showSearch={false}
          allowClear
          value={value}
          onClear={() => {
            handleChange(undefined);
          }}
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
            <EditFilled className="libro-chat-record-input-editor-icon" />
          </span>
        </>
      )}
    </div>
  );
};
