import {
  ManaModule,
  RootSlotId,
  createSlotPreference,
} from '@difizen/libro-common/app';
import { TerminalModule } from '@difizen/libro-terminal';

import { AppView } from './app.js';

// 用于文档测试页面
export const TerminalDemoModule = ManaModule.create()
  .register(
    AppView,
    createSlotPreference({
      view: AppView,
      slot: RootSlotId,
    }),
  )
  .dependOn(TerminalModule);
