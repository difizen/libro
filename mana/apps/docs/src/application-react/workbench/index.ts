import {
  ManaModule,
  createSlotPreference,
  createViewPreference,
} from '@difizen/mana-app';
import { Priority } from '@difizen/mana-app';
import { SideTabView, HeaderView, CardTabView, HeaderArea } from '@difizen/mana-app';
import { RootSlotId } from '@difizen/mana-app';

import { CommonCommand } from './command/common-command.js';
import { AppLayoutView, AppLayoutArea } from './layout/app-layout.js';
import { WorkbenchLayoutArea, WorkbenchLayoutView } from './layout/workbench-layout.js';
import { CommonMenu } from './menu/common-menu.js';
import { MenuBarView } from './menu/menu-bar-view.js';

export const WorkbenchModule = ManaModule.create().register(
  CommonCommand,
  AppLayoutView,

  MenuBarView,
  CommonMenu,
  createViewPreference({
    view: MenuBarView,
    slot: HeaderArea.middle,
    autoCreate: true,
  }),
  createSlotPreference({
    slot: RootSlotId,
    view: AppLayoutView,
  }),
  createSlotPreference({
    slot: AppLayoutArea.header,
    view: HeaderView,
  }),
  WorkbenchLayoutView,
  createSlotPreference({
    slot: AppLayoutArea.content,
    view: WorkbenchLayoutView,
  }),
  createSlotPreference({
    slot: WorkbenchLayoutArea.left,
    view: SideTabView,
    priority: Priority.DEFAULT,
  }),
  createSlotPreference({
    slot: WorkbenchLayoutArea.right,
    view: SideTabView,
    priority: Priority.DEFAULT,
    options: {
      tabPosition: 'right',
    },
  }),
  createSlotPreference({
    slot: WorkbenchLayoutArea.main,
    view: CardTabView,
    priority: Priority.DEFAULT,
  }),
);
