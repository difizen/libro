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
import { Input } from 'antd';
import { forwardRef } from 'react';

import type { IWidgetViewProps } from '../base/protocal.js';
import { WidgetView } from '../base/widget-view.js';

import './index.less';

export const LibroTextWidgetComponent = forwardRef<HTMLDivElement>(
  function LibroTextWidgetComponent(_props, ref) {
    const widgetView = useInject<LibroTextWidget>(ViewInstance);
    if (widgetView.isCommClosed) {
      return null;
    }

    const handleChange = (e: any) => {
      const data = {
        buffer_paths: [],
        method: 'update',
        state: { value: e.target.value },
      };
      widgetView.send(data);
    };

    const handlePressEnter = () => {
      const data = { method: 'custom', content: { event: 'submit' } };
      widgetView.send(data);
    };

    return (
      <div className="libro-input-widget" ref={ref}>
        <span className="libro-input-widget-description">
          {' '}
          {widgetView.description}
        </span>
        <Input
          placeholder={widgetView.placeholder}
          size="small"
          onChange={handleChange}
          onPressEnter={handlePressEnter}
        />
      </div>
    );
  },
);
@transient()
@view('libro-widget-text-view')
export class LibroTextWidget extends WidgetView {
  override view = LibroTextWidgetComponent;
  bar_style: string;
  description: string;
  description_tooltip: null;
  layout: string;
  orientation: string;
  style: string;
  placeholder: string;
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
    this.orientation = props.attributes.orientation;
    this.style = props.attributes.style;
    this.value = props.attributes.value;
    this.placeholder = props.attributes.placeholder;
  }
}
