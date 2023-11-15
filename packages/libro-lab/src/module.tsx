import { LibroJupyterModule } from '@difizen/libro-jupyter';
import {
  ManaModule,
  createSlotPreference,
  RootSlotId,
  CardTabView,
  SideTabView,
  createViewPreference,
  FileTreeView,
} from '@difizen/mana-app';

import { KernelManagerView } from './kernel-manager/index.js';
import { LibroLabApp } from './lab-app.js';
import {
  LibroLabLayoutModule,
  LibroLabLayoutSlots,
  LibroLabLayoutView,
} from './layout/index.js';

import './index.less';

export const KernelManagerModule = ManaModule.create().register(
  KernelManagerView,
  createViewPreference({
    view: KernelManagerView,
    slot: LibroLabLayoutSlots.navigator,
    openOptions: {
      reveal: false,
      order: 'kernel-manager',
    },
    autoCreate: true,
  }),
);

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
      slot: LibroLabLayoutSlots.content,
    }),
    createSlotPreference({
      view: SideTabView,
      slot: LibroLabLayoutSlots.navigator,
      options: {
        sort: true,
      },
    }),
    createViewPreference({
      view: FileTreeView,
      slot: LibroLabLayoutSlots.navigator,
      autoCreate: true,
      openOptions: {
        reveal: true,
        order: 'file-tree',
      },
    }),
  )
  .dependOn(LibroJupyterModule, KernelManagerModule, LibroLabLayoutModule);
