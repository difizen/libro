import '@opensumi/ide-i18n/lib/browser';
import { defaultConfig } from '@opensumi/ide-main-layout/lib/browser/default-config';

import { CommonBrowserModules } from './common-modules';
import { renderApp } from './render-app';

import './i18n';
import './styles.less';

import '@opensumi/ide-core-browser/lib/style/icon.less';
import '@opensumi/ide-core-browser/lib/style/index.less';

import { SlotLocation } from '@opensumi/ide-core-browser';

import { CustomToolbarLayout } from './mana-application';

export const startApp = () =>
  renderApp({
    modules: [...CommonBrowserModules],
    layoutConfig: {
      ...defaultConfig,
      ...{
        [SlotLocation.left]: {
          modules: [
            '@opensumi/ide-explorer',
            '@opensumi/ide-search',
            '@opensumi/ide-scm',
            '@opensumi/ide-extension-manager',
            '@opensumi/ide-debug',
            '@opensumi/libro-kernel-terminal',
          ],
        },
      },
      // ...{
      //   [SlotLocation.top]: {
      //     modules: ['@opensumi/ide-menu-bar', 'test-toolbar'],
      //   },
      // },
      // customAction: {
      //   modules: ['test-toolbar'],
      // },
    },
    useCdnIcon: false,
    useExperimentalShadowDom: false,
    defaultPreferences: {
      'general.theme': 'opensumi-dark',
      'general.icon': 'vscode-icons',
      'menubar.compactMode': true,
    },
    defaultPanels: {
      bottom: '@opensumi/ide-terminal-next',
      right: '',
    },
    // 引入 custom-toolbar 自定义视图时，需要自定义布局组件，可以基于 DefaultLayout 进行拓展
    layoutComponent: CustomToolbarLayout,
  });
