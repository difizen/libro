import { ViewManager, inject, singleton } from '@difizen/mana-app';

import type { IWidgetViewProps } from '../base/protocal.js';
import { WidgetViewContribution } from '../base/protocal.js';

import { HBoxWidget } from './hbox-widget-view.js';

@singleton({ contrib: WidgetViewContribution })
export class HBoxModelContribution implements WidgetViewContribution {
  @inject(ViewManager) viewManager: ViewManager;
  canHandle = (attributes: any) => {
    if (attributes._model_name === 'HBoxModel') {
      return 100;
    }
    return 1;
  };
  factory(props: IWidgetViewProps) {
    return this.viewManager.getOrCreateView(HBoxWidget, props);
  }
}
