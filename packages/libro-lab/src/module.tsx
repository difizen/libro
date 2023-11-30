import { FileView, LibroJupyterModule } from '@difizen/libro-jupyter';
import {
  ManaModule,
  createSlotPreference,
  RootSlotId,
  SideTabView,
  createViewPreference,
  HeaderArea,
} from '@difizen/mana-app';

import { GithubLinkView } from './github-link/index.js';
import { KernelManagerView } from './kernel-manager/index.js';
import { LibroLabApp } from './lab-app.js';
import { EditorTabView } from './layout/editor-tab-view.js';
import {
  LibroLabLayoutModule,
  LibroLabLayoutSlots,
  LibroLabLayoutView,
} from './layout/index.js';
import './index.less';
import { LibroLabHeaderMenuModule } from './menu/module.js';
import { LibroLabTocModule } from './toc/module.js';
import { WelcomeView } from './welcome/index.js';

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
      view: EditorTabView,
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
      view: FileView,
      slot: LibroLabLayoutSlots.navigator,
      autoCreate: true,
      openOptions: {
        reveal: true,
        order: 'file-tree',
      },
    }),
    WelcomeView,
    createViewPreference({
      view: WelcomeView,
      slot: LibroLabLayoutSlots.content,
      autoCreate: true,
      openOptions: {
        reveal: true,
        order: 'welcome',
      },
    }),
  )
  .dependOn(
    LibroJupyterModule,
    LibroLabLayoutModule,
    LibroLabHeaderMenuModule,
    LibroLabTocModule,
  );
