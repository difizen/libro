import { LibroContextKey } from '@difizen/libro-core';
import type { KernelMessage } from '@difizen/libro-kernel';
import {
  view,
  ViewOption,
  transient,
  useInject,
  ViewInstance,
  inject,
  prop,
} from '@difizen/mana-app';
import { forwardRef } from 'react';

import type { IWidgetViewProps } from '../../base/protocal.js';
import { WidgetView } from '../../base/widget-view.js';
import { ProgressBar } from '../../components/index.js';

export const LibroProgressWidgetComponent = forwardRef<HTMLDivElement>(
  function LibroProgressWidgetComponent() {
    const widgetView = useInject<ProgressWidget>(ViewInstance);
    const percent = widgetView.value / ((widgetView.max - widgetView.min) / 100);
    if (widgetView.isCommClosed) {
      return null;
    }
    return (
      <div className="libro-progress-widget">
        <div className="libro-progress-widget-description">
          {widgetView.description}
        </div>
        <ProgressBar percent={percent} />
      </div>
    );
  },
);
@transient()
@view('libro-widget-progress-view')
export class ProgressWidget extends WidgetView {
  override view = LibroProgressWidgetComponent;
  bar_style: string;
  description: string;
  description_tooltip: null;
  layout: string;
  @prop()
  max: number;
  @prop()
  min: number;
  orientation: string;
  style: string;
  @prop()
  value: number;
  constructor(
    @inject(ViewOption) props: IWidgetViewProps,
    @inject(LibroContextKey) libroContextKey: LibroContextKey,
  ) {
    super(props, libroContextKey);
    this.bar_style = props.attributes.bar_style;
    this.description = props.attributes.description;
    this.description_tooltip = props.attributes.description_tooltip;
    this.layout = props.attributes.layout;
    this.max = props.attributes.max;
    this.min = props.attributes.min;
    this.orientation = props.attributes.orientation;
    this.style = props.attributes.style;
    this.value = props.attributes.value;
  }
  /**
   * Handle incoming comm msg.
   */
  override handleCommMsg(msg: KernelMessage.ICommMsgMsg): Promise<void> {
    const data = msg.content.data as any;
    const method = data.method;
    switch (method) {
      case 'update':
      case 'echo_update':
        if (data.state.value) {
          this.value = data.state.value;
        }
        if (data.state.description) {
          this.description = data.state.description;
        }
    }
    return Promise.resolve();
  }
}
