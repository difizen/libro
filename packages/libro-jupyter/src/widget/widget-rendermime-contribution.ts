import type { BaseOutputView } from '@difizen/libro-core';
import { RenderMimeContribution } from '@difizen/libro-rendermime';
import { inject, singleton } from '@difizen/libro-common/app';

import { LibroJupyterModel } from '../libro-jupyter-model.js';

import { LibroWidgetManager } from './widget-manager.js';
import { WidgetRender } from './widget-render.js';

@singleton({ contrib: RenderMimeContribution })
export class LibroWidgetMimeContribution implements RenderMimeContribution {
  @inject(LibroWidgetManager) libroWidgetManager: LibroWidgetManager;
  canHandle = (model: BaseOutputView) => {
    const libroModel = model.cell.parent.model;
    let rank = 0;
    if (libroModel instanceof LibroJupyterModel && libroModel.kernelConnection) {
      const kc = libroModel.kernelConnection;
      const widget = this.libroWidgetManager.getOrCreateWidgets(kc);
      this.mimeTypes.forEach((mimeType) => {
        const mimeData = model.data[mimeType];
        if (mimeData && mimeData !== null) {
          const data = JSON.parse(JSON.stringify(mimeData)).model_id;
          if (Object.keys(model.data).includes(mimeType) && widget.hasModel(data)) {
            rank = 100;
          }
        }
      });
    }
    return rank;
  };
  renderType = 'widgetRenderer';
  safe = true;
  mimeTypes = ['application/vnd.jupyter.widget-view+json'];
  allowClear = true;
  render = WidgetRender;
}
