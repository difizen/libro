import {
  ManaModule,
  createSlotPreference,
  RootSlotId,
  CardTabView,
  SideTabView,
  createViewPreference,
  HeaderView,
} from '@difizen/mana-app';
import { FileTreeView } from '@difizen/mana-app';

import { LibroLabApp } from './lab-app.js';
import {
  LibroLabLayoutView,
  LibroLabSlots,
  LibroLabContentSlots,
} from './layout/index.js';

export const LibroLabModule = ManaModule.create().register(
  LibroLabApp,
  LibroLabLayoutView,
  createSlotPreference({
    view: LibroLabLayoutView,
    slot: RootSlotId,
  }),
  createSlotPreference({
    slot: LibroLabSlots.top,
    view: HeaderView,
  }),
  createSlotPreference({
    view: CardTabView,
    slot: LibroLabContentSlots.main,
  }),
  createSlotPreference({
    view: SideTabView,
    slot: LibroLabContentSlots.left,
  }),
  createViewPreference({
    view: FileTreeView,
    slot: LibroLabContentSlots.left,
    autoCreate: true,
  }),
);
