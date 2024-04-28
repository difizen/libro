import type { IWidgetViewProps } from '@difizen/libro-widget';
import { WidgetViewContribution } from '@difizen/libro-widget';
import { ViewManager, inject, singleton } from '@difizen/mana-app';

import { VBoxWidget } from './view.js';

@singleton({ contrib: WidgetViewContribution })
export class VBoxWidgetContribution implements WidgetViewContribution {
  @inject(ViewManager) viewManager: ViewManager;
  canHandle = (attributes: any) => {
    if (attributes._model_name === 'VBoxModel') {
      return 100;
    }
    if (attributes.__view_name === 'VBoxView') {
      return 100;
    }
    if (attributes._model_name === 'HBoxModel') {
      return 100;
    }
    if (attributes.__view_name === 'HBoxView') {
      return 100;
    }
    return 1;
  };
  factory(props: IWidgetViewProps) {
    return this.viewManager.getOrCreateView(VBoxWidget, props);
  }
}
