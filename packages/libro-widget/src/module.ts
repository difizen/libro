import { ManaModule } from '@difizen/mana-app';

import { BaseWidgetModule } from './base/index.js';
import { CommonWidgetsModule } from './widgets/index.js';

export const WidgetModule = ManaModule.create().dependOn(
  BaseWidgetModule,
  CommonWidgetsModule,
);
