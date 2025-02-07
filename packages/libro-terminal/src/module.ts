import {
  KernelSpecRestAPI,
  ServerConnection,
  ServerManager,
} from '@difizen/libro-kernel';
import { ManaModule } from '@difizen/libro-common/mana-app';

import { TerminalCommandContribution } from './command.js';
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
  TerminalCommandContribution,
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
