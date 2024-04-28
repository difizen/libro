import { ManaModule } from '@difizen/mana-app';

import { BaseWidgetModule } from '../base/index.js';

import { VBoxWidget, VBoxWidgetContribution } from './box/index.js';
import {
  InstancesProgressWidget,
  InstancesProgressWidgetViewContribution,
} from './instance-progress/index.js';
import { ProgressWidget, ProgressWidgetViewContribution } from './progress/index.js';
import { SilderWidgetContribution, SliderWidget } from './slider/index.js';
import { TextModelContribution, TextWidget } from './text/index.js';

export const CommonWidgetsModule = ManaModule.create()
  .register(
    VBoxWidget,
    VBoxWidgetContribution,

    SliderWidget,
    SilderWidgetContribution,

    ProgressWidget,
    ProgressWidgetViewContribution,

    InstancesProgressWidget,
    InstancesProgressWidgetViewContribution,

    TextWidget,
    TextModelContribution,
  )
  .dependOn(BaseWidgetModule);
