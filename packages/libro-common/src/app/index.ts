import { ManaModule, ManaPreset } from '../core/index.js';

import { ManaApplication } from './app.js';
import { FileTreeModule } from './file-tree/index.js';
import { LabelModule } from './label/index.js';
import { MenuModule } from './menu/index.js';
import { ModalModule } from './modal/index.js';
import { NotificationModule } from './notification/index.js';
import { ToolbarModule } from './toolbar/index.js';
import { DefaultViewModule } from './view/index.js';
import './style/index.less';

export * from './label/index.js';
export * from './tree/index.js';
export * from './file-tree/index.js';
export * from './view/index.js';
export * from './toolbar/index.js';
export * from './menu/index.js';
export * from './modal/index.js';

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

export * from '../ioc/index.js';
export * from '../observable/index.js';
export * from '../common/index.js';
export * from '../core/index.js';
