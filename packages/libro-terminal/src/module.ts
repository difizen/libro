import {
  KernelSpecRestAPI,
  ServerConnection,
  ServerManager,
} from '@difizen/libro-kernel';
import { ManaModule, RootSlotId, createSlotPreference } from '@difizen/mana-app';

import { AppView } from './app.js';
import { TerminalConfiguration } from './configuration.js';
import { TerminalConnection } from './connection.js';
import './index.less';
import { TerminalManager } from './manager.js';
import {
  TerminalConnectionFactory,
  TerminalOption,
  TerminalViewOption,
} from './protocol.js';
import { TerminalRestAPI } from './restapi.js';
import { TerminalThemeService } from './theme-service.js';
import { LibroTerminalView } from './view.js';

export const TerminalModule = ManaModule.create().register(
  TerminalConfiguration,
  TerminalConnection,
  TerminalManager,
  TerminalRestAPI,
  LibroTerminalView,
  ServerConnection,
  ServerManager,
  KernelSpecRestAPI,
  {
    token: TerminalConnectionFactory,
    useFactory: (ctx) => {
      return (options: TerminalOption) => {
        const child = ctx.container.createChild();
        child.register({ token: TerminalOption, useValue: options });
        return child.get(TerminalConnection);
      };
    },
  },
  {
    token: TerminalViewOption,
    useValue: {
      // initialCommand: '',
    },
  },
  TerminalThemeService,
);

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
