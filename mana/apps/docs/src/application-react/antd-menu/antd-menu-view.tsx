import { MacCommandOutlined } from '@ant-design/icons';
import { MAIN_MENU_BAR } from '@difizen/mana-app';
import { BaseView, view } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';
import { prop } from '@difizen/mana-app';
import * as React from 'react';
import { forwardRef } from 'react';

import { MenuRender } from '../workbench/menu/render.js';

export const ManaMenubarComponent = forwardRef(function ManaMenubarComponent(
  props,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <div ref={ref}>
      <MenuRender path={MAIN_MENU_BAR} />
    </div>
  );
});

@singleton()
@view('AntdMenuView')
export class AntdMenuView extends BaseView {
  override view = ManaMenubarComponent;
  @prop()
  count = 0;
  constructor() {
    super();
    this.title.icon = MacCommandOutlined;
    this.title.label = 'Antd 菜单';
    this.id = 'antd-menu';
  }
}
