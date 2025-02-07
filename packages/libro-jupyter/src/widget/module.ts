import { LibroKernelManageModule } from '@difizen/libro-kernel';
import { ManaModule } from '@difizen/libro-common/app';

import { VBoxWidget, VBoxWidgetContribution } from './box/index.js';
import { Comm } from './comm.js';
import {
  InstancesProgressWidget,
  InstancesProgressWidgetViewContribution,
} from './instance-progress/index.js';
import { LibroWidgets } from './libro-widgets.js';
import { ProgressWidget, ProgressWidgetViewContribution } from './progress/index.js';
import {
  LibroWidgetCommFactory,
  LibroWidgetsFactory,
  WidgetCommOption,
  WidgetsOption,
  WidgetViewContribution,
} from './protocol.js';
import { LibroWidgetManager } from './widget-manager.js';
import { LibroWidgetMimeContribution } from './widget-rendermime-contribution.js';
import { DefaultWidgetViewContribution } from './widget-view-contribution.js';
import { WidgetView } from './widget-view.js';

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
    LibroWidgetMimeContribution,
  )
  .dependOn(LibroKernelManageModule);

export const WidgetModule = ManaModule.create()
  .register(
    VBoxWidget,
    VBoxWidgetContribution,

    ProgressWidget,
    ProgressWidgetViewContribution,

    InstancesProgressWidget,
    InstancesProgressWidgetViewContribution,
  )
  .dependOn(BaseWidgetModule);
