import { LibroContextKey } from '@difizen/libro-core';
import type { IWidgetViewProps, IWidgets } from '@difizen/libro-widget';
import { WidgetView } from '@difizen/libro-widget';
import {
  view,
  transient,
  useInject,
  ViewInstance,
  prop,
  inject,
  ViewOption,
  ViewRender,
} from '@difizen/mana-app';
import { forwardRef } from 'react';

import type { WidgetState } from '../protocol.js';
import { defaultWidgetState } from '../protocol.js';

import './index.less';

const WidgetRender = (props: { widgets: IWidgets | undefined; modelId: string }) => {
  const { widgets, modelId } = props;
  if (!widgets) {
    return null;
  }
  let widgetView;
  try {
    widgetView = widgets.getModel(modelId);
  } catch (ex) {
    //
  }
  if (!widgetView) {
    return null;
  }
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

export const LibroWidgetBoxComponent = forwardRef<HTMLDivElement>(
  function LibroWidgetBoxComponent(props, ref) {
    const widget = useInject<VBoxWidget>(ViewInstance);

    return (
      <div className={`libro-widget-box ${widget.getCls()}`} ref={ref}>
        {widget.state.children.map((modelId) => (
          <WidgetRender key={modelId} widgets={widget.widgets} modelId={modelId} />
        ))}
      </div>
    );
  },
);

interface BoxState extends WidgetState {
  children: string[];
  box_style?: string;
}

@transient()
@view('libro-widget-box-view')
export class VBoxWidget extends WidgetView {
  override view = LibroWidgetBoxComponent;

  @prop()
  override state: BoxState = {
    ...defaultWidgetState,
    children: [],
  };

  constructor(
    @inject(ViewOption) props: IWidgetViewProps,
    @inject(LibroContextKey) libroContextKey: LibroContextKey,
  ) {
    super(props, libroContextKey);
    this.initialize(props);
  }

  protected initialize(props: IWidgetViewProps): void {
    const attributes = props.attributes;
    this.trySetValue(attributes, 'children');
    this.trySetValue(attributes, 'box_style');
  }

  getCls = () => {
    if (this.model_name === 'HBoxModel') {
      return 'libro-widget-hbox';
    }
    if (this.model_name === 'VBoxModel') {
      return 'libro-widget-vbox';
    }
    return '';
  };
}
