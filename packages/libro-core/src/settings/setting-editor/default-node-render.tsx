import type { RenderProps } from '@difizen/libro-common/app';
import { l10n } from '@difizen/libro-common/l10n';
import { Checkbox, DatePicker, Input, InputNumber, Select, Switch } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

const { Option } = Select;

export const DefaultInput: React.FC<RenderProps<string>> = ({ value, onChange }) => (
  <Input value={value} onChange={(event) => onChange(event.target.value)} />
);

export const DefaultInputNumber: React.FC<RenderProps<number>> = ({
  value,
  onChange,
  schema,
}) => (
  <InputNumber
    value={value}
    min={schema.minimum ?? Number.MIN_SAFE_INTEGER}
    max={schema.maximum ?? Number.MAX_SAFE_INTEGER}
    onChange={(val) => onChange(val)}
  />
);

export const DefaultCheckbox: React.FC<RenderProps<boolean>> = ({
  value,
  onChange,
}) => {
  return (
    <Checkbox checked={value} onChange={(event) => onChange(event.target.checked)}>
      {value ? l10n.t('开启') : l10n.t('关闭')}
    </Checkbox>
  );
};

export const DefaultSwitch: React.FC<RenderProps<boolean>> = ({ value, onChange }) => (
  <Switch checked={value} onChange={(checked: boolean) => onChange(checked)} />
);

export const DefaultSelect: React.FC<RenderProps<string>> = ({
  value,
  onChange,
  schema,
}) => (
  <Select value={value} onChange={(val: string) => onChange(val)}>
    {schema['enum'].map((val: string) => (
      <Option key={val} value={val}>
        {val}
      </Option>
    ))}
  </Select>
);

const dateFormat = 'YYYY/MM/DD';

export const DefaultDatePicker: React.FC<RenderProps<string>> = ({
  value,
  onChange,
}) => (
  <DatePicker
    value={dayjs(value, dateFormat)}
    onChange={(date, dateString) => onChange(dateString.toString())}
  />
);
