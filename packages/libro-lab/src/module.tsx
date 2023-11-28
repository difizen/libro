import { LibroJupyterModule } from '@difizen/libro-jupyter';
import {
  ManaModule,
  createSlotPreference,
  RootSlotId,
  CardTabView,
  SideTabView,
  createViewPreference,
  FileTreeView,
  HeaderArea,
} from '@difizen/mana-app';

import { GithubLinkView } from './github-link/index.js';
import { KernelManagerView } from './kernel-manager/index.js';
import { LibroLabApp } from './lab-app.js';
import {
  LibroLabLayoutModule,
  LibroLabLayoutSlots,
  LibroLabLayoutView,
} from './layout/index.js';
import './index.less';
import { LibroLabHeaderMenuModule } from './menu/module.js';

export const LibroLabModule = ManaModule.create()
  .register(
    LibroLabApp,
    LibroLabLayoutView,
    GithubLinkView,
    createViewPreference({
      view: GithubLinkView,
      slot: HeaderArea.right,
      openOptions: {
        order: 'github',
      },
      autoCreate: true,
    }),
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
  .dependOn(LibroJupyterModule, LibroLabLayoutModule, LibroLabHeaderMenuModule);
