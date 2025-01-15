import { MacCommandOutlined } from '@ant-design/icons';
import { BaseView, Slot, view, ViewInstance } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';
import { prop, useInject } from '@difizen/mana-app';
import * as React from 'react';
import { forwardRef } from 'react';

export enum CommandSlot {
  first = 'CommandSlot-first',
}

export const CommandPaletteComponent = forwardRef(function CommandPaletteComponent(
  props,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const instance = useInject<CommandPaletteView>(ViewInstance);
  return (
    <div ref={ref}>
      {instance.count}
      <Slot name={CommandSlot.first} />
    </div>
  );
});

@singleton()
@view('CommandPlatte')
export class CommandPaletteView extends BaseView {
  override view = CommandPaletteComponent;
  @prop()
  count = 0;
  constructor() {
    super();
    this.title.icon = MacCommandOutlined;
    this.title.label = '命令面板';
    this.id = 'command-palette';
  }
}
