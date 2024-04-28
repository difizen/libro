import { LibroKernelManageModule } from '@difizen/libro-kernel';
import { ManaModule } from '@difizen/mana-app';

import { Comm } from './comm.js';
import { LibroWidgetManager } from './widget-manager.js';
import { DefaultWidgetViewContribution } from './widget-view-contribution.js';

import {
  WidgetsOption,
  LibroWidgetCommFactory,
  WidgetCommOption,
  LibroWidgets,
  LibroWidgetsFactory,
  WidgetView,
  WidgetViewContribution,
} from './index.js';

export const BaseWidgetModule = ManaModule.create()
  .contribution(WidgetViewContribution)
  .register(
    Comm,
    {
      token: LibroWidgetCommFactory,
      useFactory: (ctx) => {
        return (options: WidgetCommOption) => {
          const child = ctx.container.createChild();
          child.register({
            token: WidgetCommOption,
            useValue: options,
          });
          return child.get(Comm);
        };
      },
    },
    LibroWidgets,
    {
      token: LibroWidgetsFactory,
      useFactory: (ctx) => {
        return (options: WidgetsOption) => {
          const child = ctx.container.createChild();
          child.register({
            token: WidgetsOption,
            useValue: options,
          });
          return child.get(LibroWidgets);
        };
      },
    },
    LibroWidgetManager,
    WidgetView,
    DefaultWidgetViewContribution,
  )
  .dependOn(LibroKernelManageModule);
