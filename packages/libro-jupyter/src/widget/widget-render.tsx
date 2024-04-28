import type { BaseOutputView } from '@difizen/libro-core';
import { RenderMimeRegistry } from '@difizen/libro-rendermime';
import type { IRenderMimeRegistry } from '@difizen/libro-rendermime';
import { LibroWidgetManager } from '@difizen/libro-widget';
import { getOrigin, useInject, ViewRender } from '@difizen/mana-app';
import React from 'react';
import './index.less';

import { LibroJupyterModel } from '../libro-jupyter-model.js';

export const WidgetRender: React.FC<{ model: BaseOutputView }> = (props: {
  model: BaseOutputView;
}) => {
  const { model } = props;

  const widgetManager = useInject(LibroWidgetManager);
  const defaultRenderMime = useInject<IRenderMimeRegistry>(RenderMimeRegistry);
  const libro = model.cell.parent;
  if (!(libro.model instanceof LibroJupyterModel) || !libro.model.kernelConnection) {
    return null;
  }
  const widgets = widgetManager.getOrCreateWidgets(
    getOrigin(libro.model.kernelConnection),
  );
  const mimeType = defaultRenderMime.preferredMimeType(model);
  if (mimeType) {
    const model_id = JSON.parse(JSON.stringify(model.data[mimeType])).model_id;
    if (model_id) {
      const widgetView = widgets.getModel(model_id);
      if (widgetView.isCommClosed) {
        return null;
      }
      return (
        <div className="libro-widget-render-container">
          <div className="libro-widget-render">
            <ViewRender view={widgetView} />
          </div>
        </div>
      );
    }
  }
  return (
    <div className="libro-widget-render-container">
      <div className="libro-widget-render empty" />
    </div>
  );
};
