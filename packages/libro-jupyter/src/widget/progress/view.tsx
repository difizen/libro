import type { JSONObject } from '@difizen/libro-common';
import { LibroContextKey } from '@difizen/libro-core';
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

import type { IWidgetViewProps, WidgetState } from '../protocol.js';
import { defaultWidgetState } from '../protocol.js';
import { WidgetView } from '../widget-view.js';

import { ProgressBar } from './progressBar.js';

export const LibroProgressWidgetComponent = forwardRef<HTMLDivElement>(
  function LibroProgressWidgetComponent() {
    const widgetView = useInject<ProgressWidget>(ViewInstance);
    const percent =
      widgetView.state.max && widgetView.state.min
        ? widgetView.state.value / ((widgetView.state.max - widgetView.state.min) / 100)
        : 0;
    if (widgetView.isCommClosed) {
      return null;
    }
    return (
      <div className="libro-progress-widget">
        <div className="libro-progress-widget-description">
          {widgetView.state.description}
        </div>
        <ProgressBar percent={percent} />
      </div>
    );
  },
);

interface ProgressState extends WidgetState {
  max?: number;
  min?: number;
  bar_style?: string;
  value: number;
}
@transient()
@view('libro-widget-progress-view')
export class ProgressWidget extends WidgetView {
  override view = LibroProgressWidgetComponent;

  @prop()
  override state: JSONObject & ProgressState = {
    ...defaultWidgetState,
    max: 1,
    min: 0,
    value: 0,
  };
  constructor(
    @inject(ViewOption) props: IWidgetViewProps,
    @inject(LibroContextKey) libroContextKey: LibroContextKey,
  ) {
    super(props, libroContextKey);

    const attributes = props.attributes;
    this.state.max = attributes.max;
    this.state.min = attributes.min;
    this.setState(attributes);
  }
}
