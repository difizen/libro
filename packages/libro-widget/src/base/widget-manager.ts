import { LibroService } from '@difizen/libro-core';
import type { IKernelConnection } from '@difizen/libro-kernel';
import { KernelConnection, LibroKernelManager } from '@difizen/libro-kernel';
import { inject, prop, singleton, ApplicationContribution } from '@difizen/mana-app';

import type { LibroWidgets } from './libro-widgets.js';
import { LibroWidgetsFactory } from './protocal.js';
import type { WidgetsOption } from './protocal.js';

@singleton({ contrib: ApplicationContribution })
export class LibroWidgetManager implements ApplicationContribution {
  @inject(LibroWidgetsFactory) widgetsFactory!: (
    options: WidgetsOption,
  ) => LibroWidgets;
  @inject(LibroKernelManager) kernelManager: LibroKernelManager;
  @inject(LibroService) libroService: LibroService;

  initialize = () => {
    this.kernelManager.onConnectToKernel((kc) => {
      if (kc instanceof KernelConnection) {
        this.getOrCreateWidgets(kc);
      }
    });
  };

  getOrCreateWidgets = (kc: IKernelConnection) => {
    const widgets = this.widgets.get(kc.id);
    if (widgets) {
      return widgets;
    }
    const newWidgets = this.widgetsFactory({ kc, id: kc.id });
    this.widgets.set(kc.id, newWidgets);
    return newWidgets;
  };

  getWidgets(id: string) {
    return this.widgets.get(id);
  }

  /**
   * Dictionary of model ids and model instance promises
   */
  @prop()
  protected widgets: Map<string, LibroWidgets> = new Map();
}
