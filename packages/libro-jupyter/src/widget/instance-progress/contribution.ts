import { ViewManager, inject, singleton } from '@difizen/libro-common/mana-app';

import type { IWidgetViewProps } from '../protocol.js';
import { WidgetViewContribution } from '../protocol.js';

import { InstancesProgressWidget } from './view.js';

@singleton({ contrib: WidgetViewContribution })
export class InstancesProgressWidgetViewContribution implements WidgetViewContribution {
  @inject(ViewManager) viewManager: ViewManager;
  canHandle = (attributes: any) => {
    if (attributes._model_name === 'InstancesProgressModel') {
      return 100;
    }
    return 1;
  };
  factory(props: IWidgetViewProps) {
    return this.viewManager.getOrCreateView(InstancesProgressWidget, props);
  }
}
