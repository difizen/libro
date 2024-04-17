import { EditFilled } from '@ant-design/icons';
import { LibroContextKey } from '@difizen/libro-core';
import { useInject } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Input, Popover } from 'antd';
import classNames from 'classnames';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useCallback, useState } from 'react';
import './index.less';

interface VariableNameInputPopoverContentProps {
  value: string;
  handleVariableNameChange: (variableName: string) => void;
  checkVariableNameAvailable: (variableName: string) => boolean;
  cancel: () => void;
}

export const VariableNameInputPopoverContent: FC<
  VariableNameInputPopoverContentProps
> = (props: VariableNameInputPopoverContentProps) => {
  const { value, handleVariableNameChange, checkVariableNameAvailable, cancel } = props;
  const [variableNameAvailable, setVariableNameAvailable] = useState(true);
  const [variableName, setVariableName] = useState(value);

  useEffect(() => {
    setVariableName(value);
  }, [value]);

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (checkVariableNameAvailable(e.target.value)) {
        setVariableNameAvailable(false);
      } else {
        setVariableNameAvailable(true);
      }
      setVariableName(e.target.value);
    },
    [checkVariableNameAvailable],
  );

  const handValueSave = useCallback(() => {
    handleVariableNameChange(variableName);
    cancel();
  }, [variableName, handleVariableNameChange, cancel]);

  return (
    <>
      <Input
        status={`${variableNameAvailable ? '' : 'warning'}`}
        className="libro-variable-name-input-component"
        onChange={handleValueChange}
        value={variableName}
      />

      {!variableNameAvailable && (
        <span className="libro-variable-name-input-warning-text">
          {l10n.t('当前变量名已存在')}
        </span>
      )}

      <div className="libro-variable-name-input-actions">
        <span onClick={cancel}>{l10n.t('取消')}</span>
        <span onClick={handValueSave}>{l10n.t('保存')}</span>
      </div>
    </>
  );
};

interface VariableNameInputProps {
  value: string;
  handleVariableNameChange: (variableName: string) => void;
  checkVariableNameAvailable: (variableName: string) => boolean;
  classname?: string;
}
const variableNameInputCls = 'libro-variable-name-input';
export const VariableNameInput: FC<VariableNameInputProps> = (
  props: VariableNameInputProps,
) => {
  const { value } = props;
  const [popoverVisible, setPopoverVisible] = useState(false);
  const contextKey = useInject(LibroContextKey);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className={classNames(variableNameInputCls, props.classname)} ref={ref}>
      <span className="libro-variable-name-input-label">Save: </span>
      <span className="libro-variable-name-input-value">{value || '...'}</span>
      <span className="libro-variable-name-input-popover">
        <Popover
          content={
            <VariableNameInputPopoverContent
              {...props}
              cancel={() => {
                setPopoverVisible(false);
              }}
            />
          }
          placement="bottomLeft"
          open={popoverVisible}
          onOpenChange={(visible) => {
            if (visible) {
              contextKey.disableCommandMode();
            } else {
              contextKey.enableCommandMode();
            }
            setPopoverVisible(visible);
          }}
          getPopupContainer={() => {
            return ref.current?.getElementsByClassName(
              variableNameInputCls,
            )[0] as HTMLElement;
          }}
          trigger="click"
        >
          <EditFilled />
        </Popover>
      </span>
    </div>
  );
};
