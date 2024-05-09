import type { JSONObject } from '@difizen/libro-common';
import { LibroContextKey } from '@difizen/libro-core';
import type { IWidgetViewProps } from '@difizen/libro-widget';
import { WidgetView } from '@difizen/libro-widget';
import {
  view,
  transient,
  useInject,
  ViewInstance,
  prop,
  inject,
  ViewOption,
} from '@difizen/mana-app';
import { Slider } from 'antd';
import { forwardRef } from 'react';

import type { OrientableState, WidgetState } from '../protocol.js';
import { defaultWidgetState } from '../protocol.js';
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
    this.trySetValue(attributes, 'behavior');
    this.trySetValue(attributes, 'continuous_update');
    this.trySetValue(attributes, 'description');
    this.trySetValue(attributes, 'description_allow_html');
    this.trySetValue(attributes, 'disabled');
    this.trySetValue(attributes, 'layout');
    this.trySetValue(attributes, 'max');
    this.trySetValue(attributes, 'min');
    this.trySetValue(attributes, 'orientation');
    this.trySetValue(attributes, 'readout');
    this.trySetValue(attributes, 'readout_format');
    this.trySetValue(attributes, 'step');
    this.trySetValue(attributes, 'style');
    this.trySetValue(attributes, 'value');
  }

  // override handleCommMsg(msg: KernelMessage.ICommMsgMsg): Promise<void> {
  //   const data = msg.content.data as any;
  //   const method = data.method;
  //   switch (method) {
  //     case 'update':
  //     case 'echo_update':
  //       if (data.state.value) {
  //         this.value = data.state.value;
  //       }
  //   }
  //   return Promise.resolve();
  // }

  handleChange = (value: number) => {
    const data = {
      buffer_paths: [],
      method: 'update',
      state: { value: value },
    };
    this.send(data);
  };
}
