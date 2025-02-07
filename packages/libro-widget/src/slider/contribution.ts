import type { IWidgetViewProps } from '@difizen/libro-jupyter';
import { WidgetViewContribution } from '@difizen/libro-jupyter';
import { ViewManager, inject, singleton } from '@difizen/libro-common/mana-app';

import { SliderWidget } from './view.js';

@singleton({ contrib: WidgetViewContribution })
export class SilderWidgetContribution implements WidgetViewContribution {
  @inject(ViewManager) viewManager: ViewManager;
  canHandle = (attributes: any) => {
    if (attributes._model_name === 'IntSliderModel') {
      return 100;
    }
    if (attributes.__view_name === 'IntSliderView') {
      return 100;
    }
    if (attributes._model_name === 'FloatSliderModel') {
      return 100;
    }
    return 1;
  };
  factory(props: IWidgetViewProps) {
    return this.viewManager.getOrCreateView(SliderWidget, props);
  }
}
