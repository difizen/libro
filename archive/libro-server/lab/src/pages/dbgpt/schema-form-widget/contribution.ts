import { ViewManager, inject, singleton } from '@difizen/mana-app';
import type { IWidgetViewProps } from '@difizen/libro-jupyter';
import { WidgetViewContribution } from '@difizen/libro-jupyter';
import { LibroSchemaFormtWidget } from './view.js';

@singleton({ contrib: WidgetViewContribution })
export class SchemaFormModelContribution implements WidgetViewContribution {
  @inject(ViewManager) viewManager: ViewManager;
  canHandle = (attributes: any) => {
    if (attributes._model_name === 'SchemaFormModel') {
      return 100;
    }
    return 1;
  };
  factory(props: IWidgetViewProps) {
    return this.viewManager.getOrCreateView(LibroSchemaFormtWidget, props);
  }
}
