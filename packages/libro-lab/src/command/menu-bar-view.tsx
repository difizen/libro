import { MacCommandOutlined } from '@ant-design/icons';
import {
  BaseView,
  MAIN_MENU_BAR,
  MenuBarRender,
  prop,
  singleton,
  view,
} from '@difizen/mana-app';
import { forwardRef } from 'react';

export const ManaMenubarComponent = forwardRef(function GithubLinkComponent() {
  return <MenuBarRender menuPath={MAIN_MENU_BAR} />;
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
