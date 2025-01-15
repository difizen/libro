import { MacCommandOutlined } from '@ant-design/icons';
import { BaseView, view } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';
import { prop } from '@difizen/mana-app';
import { MenuBarRender, MAIN_MENU_BAR } from '@difizen/mana-app';
import * as React from 'react';

export const ManaMenubarComponent = React.forwardRef(function ManaMenubarComponent(
  props,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <div ref={ref}>
      <MenuBarRender menuPath={MAIN_MENU_BAR} />
    </div>
  );
});

@singleton()
@view('MenuBarView')
export class MenuBarView extends BaseView {
  override view = ManaMenubarComponent;
  @prop()
  count = 0;
  constructor() {
    super();
    this.title.icon = MacCommandOutlined;
    this.title.label = '菜单';
    this.id = 'menu-bar';
  }
}
