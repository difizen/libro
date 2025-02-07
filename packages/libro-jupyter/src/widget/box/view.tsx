import type { CellView } from '@difizen/libro-core';
import { LibroContextKey } from '@difizen/libro-core';
import {
  view,
  transient,
  useInject,
  ViewInstance,
  prop,
  inject,
  ViewOption,
  ViewRender,
  getOrigin,
} from '@difizen/libro-common/mana-app';
import { forwardRef } from 'react';

import type { IWidgets, IWidgetViewProps, WidgetState } from '../protocol.js';
import { defaultWidgetState } from '../protocol.js';
import { WidgetView } from '../widget-view.js';

import './index.less';

const WidgetRender = (props: {
  cell?: CellView;
  widgets: IWidgets | undefined;
  modelId: string;
}) => {
  const { widgets, modelId, cell } = props;
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
  if (cell) {
    widgetView.setCell(getOrigin(cell));
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
          <WidgetRender
            key={modelId}
            cell={widget.cell}
            widgets={widget.widgets}
            modelId={modelId}
          />
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
    this.setState(attributes);
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
