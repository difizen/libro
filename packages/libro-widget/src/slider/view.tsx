import type { JSONObject } from '@difizen/libro-common';
import { LibroContextKey } from '@difizen/libro-core';
import type { IWidgetViewProps } from '@difizen/libro-jupyter';
import type { OrientableState, WidgetState } from '@difizen/libro-jupyter';
import { WidgetView } from '@difizen/libro-jupyter';
import { defaultWidgetState } from '@difizen/libro-jupyter';
import {
  view,
  transient,
  useInject,
  ViewInstance,
  prop,
  inject,
  ViewOption,
} from '@difizen/libro-common/mana-app';
import { Slider } from 'antd';
import { forwardRef } from 'react';

import './index.less';

export const LibroWidgetIntSliderComponent = forwardRef<HTMLDivElement>(
  function LibroWidgetIntSliderComponent(props, ref) {
    const widget = useInject<SliderWidget>(ViewInstance);

    if (widget.isCommClosed) {
      return null;
    }

    return (
      <div className="libro-widget-slider" ref={ref}>
        <Slider
          max={widget.state.max}
          min={widget.state.min}
          vertical={widget.state.orientation === 'vertical'}
          disabled={widget.state.disabled}
          onChange={widget.handleChange}
          value={widget.state.value}
        />
      </div>
    );
  },
);

interface SliderState extends WidgetState, OrientableState {
  max?: number;
  min?: number;
  step: number;
  value: number;
}

@transient()
@view('libro-widget-slider-view')
export class SliderWidget extends WidgetView {
  override view = LibroWidgetIntSliderComponent;

  @prop()
  override state: JSONObject & SliderState = {
    ...defaultWidgetState,
    orientation: 'horizontal',
    step: 1,
    value: 0,
  };

  constructor(
    @inject(ViewOption) props: IWidgetViewProps,
    @inject(LibroContextKey) libroContextKey: LibroContextKey,
  ) {
    super(props, libroContextKey);
    this.initialize(props);
  }

  protected initialize(props: IWidgetViewProps): void {
    if (this.model_name === 'FloatSliderModel') {
      if (!this.state.step) {
        this.state.step === 0.01;
      }
    }
    const attributes = props.attributes;
    this.state.max = attributes.max;
    this.state.min = attributes.min;
    this.setState(attributes);
  }

  handleChange = (value: number) => {
    const data = {
      buffer_paths: [],
      method: 'update',
      state: { value: value },
    };
    this.send(data);
  };
}
