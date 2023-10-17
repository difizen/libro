import { LibroKernelManageModule } from '@difizen/libro-kernel';
import { ManaModule } from '@difizen/mana-app';

import { Comm } from './base/comm.js';
import {
  WidgetsOption,
  LibroWidgetCommFactory,
  WidgetCommOption,
  LibroWidgets,
  LibroWidgetsFactory,
  WidgetView,
  WidgetViewContribution,
} from './base/index.js';
import { LibroWidgetManager } from './base/widget-manager.js';
import { DefaultWidgetViewContribution } from './base/widget-view-contribution.js';
import { HBoxModelContribution } from './widgets/hbox-widget-view-contribution.js';
import { HBoxWidget } from './widgets/hbox-widget-view.js';
import { ProgressWidget } from './widgets/index.js';
import { InstancesProgressWidgetViewContribution } from './widgets/instances-progress-widget-view-contribution.js';
import { InstancesProgressWidget } from './widgets/instances-progress-widget-view.js';
import { ProgressWidgetViewContribution } from './widgets/progress-widget-view-contribution.js';
import { TextModelContribution } from './widgets/text-widget-view-contribution.js';
import { LibroTextWidget } from './widgets/text-widget-view.js';

export const WidgetModule = ManaModule.create()
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
    ProgressWidget,
    DefaultWidgetViewContribution,
    ProgressWidgetViewContribution,
    InstancesProgressWidgetViewContribution,
    InstancesProgressWidget,
    HBoxModelContribution,
    HBoxWidget,
    LibroTextWidget,
    TextModelContribution,
  )
  .dependOn(LibroKernelManageModule);
