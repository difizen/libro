import { LibroContextKey } from '@difizen/libro-core';
import type { KernelMessage } from '@difizen/libro-kernel';
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
        {widget.children.map((modelId) => (
          <WidgetRender key={modelId} widgets={widget.widgets} modelId={modelId} />
        ))}
      </div>
    );
  },
);

@transient()
@view('libro-widget-box-view')
export class VBoxWidget extends WidgetView {
  override view = LibroWidgetBoxComponent;

  @prop() children: string[] = [];
  @prop() box_style?: string;

  constructor(
    @inject(ViewOption) props: IWidgetViewProps,
    @inject(LibroContextKey) libroContextKey: LibroContextKey,
  ) {
    super(props, libroContextKey);
  }

  override initialize(props: IWidgetViewProps): void {
    super.initialize(props);
    const attributes = props.attributes;
    this.trySetValue(attributes, 'children');
    this.trySetValue(attributes, 'box_style');
  }

  override handleCommMsg(msg: KernelMessage.ICommMsgMsg): Promise<void> {
    const data = msg.content.data as any;
    const method = data.method;
    switch (method) {
      case 'update':
      case 'echo_update':
        if (data.state.children) {
          this.children = data.state.children;
        }
    }
    return Promise.resolve();
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
