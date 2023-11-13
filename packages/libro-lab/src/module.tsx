import { LibroJupyterModule } from '@difizen/libro-jupyter';
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
import {
  LibroLabLayoutModule,
  LibroLabLayoutSlots,
  LibroLabLayoutView,
} from './layout/index.js';

export const LibroLabModule = ManaModule.create()
  .register(
    LibroLabApp,
    LibroLabLayoutView,
    createSlotPreference({
      view: LibroLabLayoutView,
      slot: RootSlotId,
    }),
    createSlotPreference({
      view: CardTabView,
      slot: LibroLabLayoutSlots.main,
    }),
    createSlotPreference({
      view: SideTabView,
      slot: LibroLabLayoutSlots.navigator,
    }),
    createViewPreference({
      view: FileTreeView,
      slot: LibroLabLayoutSlots.navigator,
      autoCreate: true,
    }),
  )
  .dependOn(LibroLabLayoutModule, LibroJupyterModule);
