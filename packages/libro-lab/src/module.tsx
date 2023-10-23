import {
  ManaModule,
  createSlotPreference,
  RootSlotId,
  CardTabView,
  SideTabView,
  createViewPreference,
} from '@difizen/mana-app';
import { FileTreeView } from '@difizen/mana-app';

import { LibroLabApp } from './lab-app.js';
import { LibroLabLayoutView, LibroLabSlots } from './layout/index.js';

export const LibroLabModule = ManaModule.create().register(
  LibroLabApp,
  LibroLabLayoutView,
  createSlotPreference({
    view: LibroLabLayoutView,
    slot: RootSlotId,
  }),
  createSlotPreference({
    view: CardTabView,
    slot: LibroLabSlots.main,
  }),
  createSlotPreference({
    view: SideTabView,
    slot: LibroLabSlots.left,
  }),
  createViewPreference({
    view: FileTreeView,
    slot: LibroLabSlots.left,
    autoCreate: true,
  }),
);
