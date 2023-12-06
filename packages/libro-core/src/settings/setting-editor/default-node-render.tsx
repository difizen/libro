import type { RenderProps } from '@difizen/mana-app';
import { Input, Checkbox, InputNumber, Switch, Select, DatePicker } from 'antd';
import moment from 'moment';
import type { FC } from 'react';

const { Option } = Select;

export const DefaultInput: FC<RenderProps<string>> = ({ value, onChange }) => (
  <Input value={value} onChange={(event) => onChange(event.target.value)} />
);

export function DefaultInputNumber({ value, onChange, schema }: RenderProps<number>) {
  return (
    <InputNumber
      value={value}
      min={schema.minimum ?? Number.MIN_SAFE_INTEGER}
      max={schema.maximum ?? Number.MAX_SAFE_INTEGER}
      onChange={(val) => onChange(val)}
    />
  );
}

export function DefaultCheckbox({ value, onChange }: RenderProps<boolean>) {
  return (
    <Checkbox checked={value} onChange={(event) => onChange(event.target.checked)}>
      {String(value)}
    </Checkbox>
  );
}

export function DefaultSwitch({ value, onChange }: RenderProps<boolean>) {
  return <Switch checked={value} onChange={(checked: boolean) => onChange(checked)} />;
}
export function DefaultSelect({ value, onChange, schema }: RenderProps<string>) {
  return (
    <Select value={value} onChange={(val: string) => onChange(val)}>
      {schema['enum'].map((val: string) => (
        <Option key={val} value={val}>
          {val}
        </Option>
      ))}
    </Select>
  );
}

const dateFormat = 'YYYY/MM/DD';

export function DefaultDatePicker({ value, onChange }: RenderProps<string>) {
  return (
    <DatePicker
      value={moment(value, dateFormat)}
      onChange={(date, dateString) => onChange(dateString)}
    />
  );
}
