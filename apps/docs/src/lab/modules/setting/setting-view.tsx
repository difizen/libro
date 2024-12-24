import { MacCommandOutlined } from '@ant-design/icons';
import { inject, singleton, view, ViewManager } from '@difizen/mana-app';
import { BaseView } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { forwardRef } from 'react';

export const SettingComponent = forwardRef(function SettingComponent() {
  return <div className="libro-lab-setting-page">here</div>;
});

@singleton()
@view('setting-view')
export class SettingView extends BaseView {
  override view = SettingComponent;
  viewManager: ViewManager;
  constructor(@inject(ViewManager) viewManager: ViewManager) {
    super();
    this.title.icon = MacCommandOutlined;
    this.title.label = () => <div>{l10n.t('设置')}</div>;
    this.title.closable = false;
    this.viewManager = viewManager;
  }
}
