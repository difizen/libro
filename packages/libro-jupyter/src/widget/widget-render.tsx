import type { BaseOutputView, LibroOutputView } from '@difizen/libro-core';
import { RenderMimeRegistry } from '@difizen/libro-rendermime';
import type { IRenderMimeRegistry } from '@difizen/libro-rendermime';
import {
  getOrigin,
  useInject,
  useObserve,
  ViewInstance,
  ViewRender,
} from '@difizen/libro-common/app';
import React from 'react';

import './index.less';
import { LibroJupyterModel } from '../libro-jupyter-model.js';

import { LibroWidgetManager } from './widget-manager.js';
import type { WidgetView } from './widget-view.js';

const WidgetViewRender: React.FC<{ view: WidgetView }> = (props: {
  view: WidgetView;
}) => {
  const widgetView = useObserve(props.view);
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
};

export const WidgetRender: React.FC<{ model: BaseOutputView }> = (props: {
  model: BaseOutputView;
}) => {
  const { model } = props;

  // The widget will be rendered in the output through the MIME mechanism, obtaining the output context.
  const output = useInject<LibroOutputView>(ViewInstance);

  const widgetManager = useInject(LibroWidgetManager);
  const defaultRenderMime = useInject<IRenderMimeRegistry>(RenderMimeRegistry);
  const libro = model.cell.parent;
  if (!(libro.model instanceof LibroJupyterModel) || !libro.model.kernelConnection) {
    return null;
  }
  const widgets = widgetManager.getOrCreateWidgets(
    getOrigin(libro.model.kernelConnection),
  );
  let widgetView = undefined;
  const mimeType = defaultRenderMime.preferredMimeType(model);
  if (mimeType) {
    const model_id = JSON.parse(JSON.stringify(model.data[mimeType])).model_id;
    if (model_id) {
      widgetView = widgets.getModel(model_id);
      widgetView.setCell(getOrigin(output.cell));
      return <WidgetViewRender view={widgetView} />;
    }
  }
  return (
    <div className="libro-widget-render-container">
      <div className="libro-widget-render empty" />
    </div>
  );
};
