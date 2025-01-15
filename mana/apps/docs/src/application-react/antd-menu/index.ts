import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { WorkbenchLayoutArea } from '../workbench/layout/workbench-layout.js';

import { AntdMenuView } from './antd-menu-view.js';

export const AntdMenuModule = ManaModule.create().register(
  AntdMenuView,
  createViewPreference({
    view: AntdMenuView,
    slot: WorkbenchLayoutArea.main,
    autoCreate: true,
  }),
);
