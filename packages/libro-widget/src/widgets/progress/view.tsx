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

import type { IWidgetViewProps } from '../../base/protocal.js';
import { WidgetView } from '../../base/widget-view.js';
import { ProgressBar } from '../../components/index.js';
import type { WidgetState } from '../protocol.js';
import { defaultWidgetState } from '../protocol.js';

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
    this.trySetValue(attributes, 'bar_style');
    this.trySetValue(attributes, 'description');
    this.trySetValue(attributes, 'description_allow_html');
    this.trySetValue(attributes, 'disabled');
    this.trySetValue(attributes, 'layout');
    this.trySetValue(attributes, 'max');
    this.trySetValue(attributes, 'min');
    this.trySetValue(attributes, 'orientation');
    this.trySetValue(attributes, 'style');
    this.trySetValue(attributes, 'value');
  }
}
