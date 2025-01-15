import type { RenderProps } from '@difizen/mana-app';
import { Checkbox, DatePicker, Input, InputNumber, Select, Switch } from 'antd';
import moment from 'moment';
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
      {value ? '开启' : '关闭'}
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
    {schema.enum.map((val: string) => (
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
    value={moment(value, dateFormat)}
    onChange={(date, dateString) => onChange(dateString)}
  />
);
