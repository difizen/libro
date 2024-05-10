import type { IWidgetViewProps } from '@difizen/libro-jupyter';
import { WidgetViewContribution } from '@difizen/libro-jupyter';
import { ViewManager, inject, singleton } from '@difizen/mana-app';

import { TextWidget } from './view.js';

@singleton({ contrib: WidgetViewContribution })
export class TextModelContribution implements WidgetViewContribution {
  @inject(ViewManager) viewManager: ViewManager;
  canHandle = (attributes: any) => {
    if (attributes._model_name === 'TextModel') {
      return 100;
    }
    return 1;
  };
  factory(props: IWidgetViewProps) {
    return this.viewManager.getOrCreateView(TextWidget, props);
  }
}
