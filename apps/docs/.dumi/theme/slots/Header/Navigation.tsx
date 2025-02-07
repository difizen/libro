import { l10n, L10nLang } from '@difizen/libro-common/mana-l10n';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { Link, useLocation } from 'dumi';
import * as React from 'react';

import { IS_MOBILE } from '../../layouts/DocLayout.js';

const locales = {
  cn: {
    manual: '基础指南',
    introduction: '介绍',
    integration: '快速集成',
    quickstart: '快速开始',
    examples: '输出示例',
    updates: '更新',
    libroai: 'Libro AI',
    datareport: '数据报告',
    quantexpert: 'quant expert'
  },
  en: {
    manual: 'manual',
    introduction: 'introduction',
    integration: 'integration',
    quickstart: 'quickstart',
    examples: 'examples',
    updates: 'updates',
    libroai: 'Libro AI',
    datareport: 'data report',
    quantexpert: 'quant expert'
  },
};

export interface NavigationProps {
  onLangChange: () => void;
}

const HeaderNavigation: React.FC<NavigationProps> = () => {
  const isMobile = localStorage.getItem(IS_MOBILE) === 'true';
  const { pathname } = useLocation();
  const currentLang = l10n.getLang();
  const urlPath = window.location.pathname;
  const titleLang = urlPath.startsWith(`/${L10nLang.zhCN}`)
    ? locales.cn
    : locales.en;
  const urlLang = urlPath.startsWith(`/${L10nLang.zhCN}`)
    ? L10nLang.zhCN
    : L10nLang.enUS;
  let newUrl = '';
  if (currentLang !== urlLang) {
    newUrl =
      currentLang === L10nLang.enUS
        ? urlPath.replace(`/${urlLang}`, '')
        : `/${currentLang}`;
  }

  const menuMode = isMobile ? 'inline' : 'horizontal';
  const module = pathname.split('/').filter(Boolean).slice(0, -1).join('/');
  const activeMenuItem = module || 'home';

  const items: MenuProps['items'] = [
    {
      label: (
        <Link to={`${newUrl}/manual`}>
          {titleLang.manual}
        </Link>
      ),
      key: 'docs/manual',
    },
    {
      label: (
        <Link to={`${newUrl}/introduction`}>
          {titleLang.introduction}
        </Link>
      ),
      key: 'docs/introduction',
    },
    {
      label: (
        <Link to={`${newUrl}/integration`}>
          {titleLang.integration}
        </Link>
      ),
      key: 'docs/integration',
    },
    {
      label: (
        <Link to={`${newUrl}/quickstart`}>
          {titleLang.quickstart}
        </Link>
      ),
      key: 'docs/quickstart',
    },
    {
      label: (
        <Link to={`${newUrl}/examples`}>
          {titleLang.examples}
        </Link>
      ),
      key: 'docs/examples',
    },
    {
      label: (
        <Link to={`${newUrl}/updates`}>
          {titleLang.updates}
        </Link>
      ),
      key: 'docs/updates',
    },
  ].filter(Boolean);

  return (
    <Menu
      mode={menuMode}
      selectedKeys={[activeMenuItem]}
      className="nav"
      disabledOverflow
      items={items}
    />
  );
};

export default HeaderNavigation;
