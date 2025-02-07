import { MacCommandOutlined } from '@ant-design/icons';
import {
  BaseView,
  MAIN_MENU_BAR,
  MenuBarRender,
  prop,
  singleton,
  view,
} from '@difizen/libro-common/app';
import { l10n } from '@difizen/libro-common/l10n';
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
    this.title.label = () => <div>{l10n.t('菜单')}</div>;
    this.id = 'menu-bar';
  }
}
