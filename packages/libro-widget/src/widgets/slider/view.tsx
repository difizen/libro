import { LibroContextKey } from '@difizen/libro-core';
import type { KernelMessage } from '@difizen/libro-kernel';
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
import './index.less';

export const LibroWidgetIntSliderComponent = forwardRef<HTMLDivElement>(
  function LibroWidgetIntSliderComponent(props, ref) {
    const widget = useInject<SliderWidget>(ViewInstance);

    if (widget.isCommClosed) {
      return null;
    }

    return (
      <div className="libro-widget-slider" ref={ref}>
        <Slider onChange={widget.handleChange} value={widget.value} />
      </div>
    );
  },
);

@transient()
@view('libro-widget-slider-view')
export class SliderWidget extends WidgetView {
  override view = LibroWidgetIntSliderComponent;

  @prop() behavior = 'drag-drop';
  @prop() continuous_update = false;
  @prop() description = '';
  @prop() description_allow_html = false;
  @prop() disabled = false;
  @prop() layout?: string;
  @prop() max?: number;
  @prop() min?: number;
  @prop() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @prop() readout = true;
  @prop() readout_format = 'd';
  @prop() step = 1;
  @prop() style?: string;

  @prop() value: number;

  constructor(
    @inject(ViewOption) props: IWidgetViewProps,
    @inject(LibroContextKey) libroContextKey: LibroContextKey,
  ) {
    super(props, libroContextKey);
  }

  override initialize(props: IWidgetViewProps): void {
    super.initialize(props);
    if (this.model_name === 'FloatSliderModel') {
      if (!this.step) {
        this.step === 0.01;
      }
    }
    const attributes = props.attributes;
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

  override handleCommMsg(msg: KernelMessage.ICommMsgMsg): Promise<void> {
    const data = msg.content.data as any;
    const method = data.method;
    switch (method) {
      case 'update':
      case 'echo_update':
        if (data.state.value) {
          this.value = data.state.value;
        }
    }
    return Promise.resolve();
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
