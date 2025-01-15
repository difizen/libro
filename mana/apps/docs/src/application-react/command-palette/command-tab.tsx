import { MacCommandOutlined } from '@ant-design/icons';
import { BaseView, view } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';
import * as React from 'react';
import { forwardRef } from 'react';

export const CommandTabViewComponent = forwardRef(function CommandTabViewComponent(
  props,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return <div ref={ref} />;
});

@singleton()
@view('Commandtab')
export class CommandTabView extends BaseView {
  override view = CommandTabViewComponent;

  constructor() {
    super();
    this.title.icon = MacCommandOutlined;
    this.title.label = 'tab1';
    this.id = 'command-palette-tab1';
  }
}
