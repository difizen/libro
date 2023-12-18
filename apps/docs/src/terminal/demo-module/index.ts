import { TerminalModule } from '@difizen/libro-terminal';
import { ManaModule, RootSlotId, createSlotPreference } from '@difizen/mana-app';
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
