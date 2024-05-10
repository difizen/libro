import { ViewManager, inject, singleton } from '@difizen/mana-app';

import type { IWidgetViewProps } from './protocol.js';
import { WidgetViewContribution } from './protocol.js';
import { WidgetView } from './widget-view.js';

@singleton({ contrib: WidgetViewContribution })
export class DefaultWidgetViewContribution implements WidgetViewContribution {
  @inject(ViewManager) viewManager: ViewManager;
  canHandle = () => 1;
  factory(props: IWidgetViewProps) {
    return this.viewManager.getOrCreateView(WidgetView, props);
  }
}
