import { ManaModule, ManaPreset } from '@difizen/mana-core';

import { ManaApplication } from './app';
import { FileTreeModule } from './file-tree';
import { LabelModule } from './label';
import { MenuModule } from './menu';
import { ModalModule } from './modal';
import { NotificationModule } from './notification';
import { ToolbarModule } from './toolbar';
import { DefaultViewModule } from './view';
import './style/index.less';

export * from './label';
export * from './tree';
export * from './file-tree';
export * from './view';
export * from './toolbar';
export * from './menu';
export * from './modal';

export const ManaAppPreset = ManaModule.create()
  .register(ManaApplication)
  .dependOn(
    ManaPreset,
    ToolbarModule,
    MenuModule,
    LabelModule,
    FileTreeModule,
    DefaultViewModule,
    ModalModule,
    NotificationModule,
  );

export * from '@difizen/mana-syringe';
export * from '@difizen/mana-observable';
export * from '@difizen/mana-common';
export * from '@difizen/mana-core';
