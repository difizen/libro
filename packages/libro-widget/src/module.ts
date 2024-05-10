import { WidgetModule } from '@difizen/libro-jupyter';
import { ManaModule } from '@difizen/mana-app';

import { SilderWidgetContribution, SliderWidget } from './slider/index.js';
import { TextModelContribution, TextWidget } from './text/index.js';

export const CommonWidgetsModule = ManaModule.create()
  .register(
    SliderWidget,
    SilderWidgetContribution,

    TextWidget,
    TextModelContribution,
  )
  .dependOn(WidgetModule);
