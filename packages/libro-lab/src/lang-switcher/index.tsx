import { singleton, useInject, view } from '@difizen/mana-app';
import { BaseView } from '@difizen/mana-app';
import { l10n, L10nLang } from '@difizen/mana-l10n';
import { Select } from 'antd';
import { forwardRef } from 'react';

import { LayoutService } from '../layout/layout-service.js';

const langList = [
  { value: L10nLang.zhCN, label: '中文' },
  { value: L10nLang.enUS, label: 'En' },
];
export const LangSwitcherComponent = forwardRef(function GithubLinkComponent() {
  const layoutService = useInject(LayoutService);

  const handleChange = (value: string) => {
    l10n.changeLang(value as L10nLang);
    layoutService.refresh();
  };

  return (
    <Select
      defaultValue={l10n.getLang()}
      style={{ width: 120 }}
      options={langList}
      onChange={handleChange}
    />
  );
});

@singleton()
@view('lang-switcher')
export class LangSwitcherView extends BaseView {
  override view = LangSwitcherComponent;
}
