import { LibroContextKey } from '@difizen/libro-core';
import type { IWidgetViewProps } from '@difizen/libro-jupyter';
import { WidgetView } from '@difizen/libro-jupyter';
import {
  view,
  ViewOption,
  transient,
  useInject,
  ViewInstance,
  inject,
  prop,
} from '@difizen/libro-common/app';
import { Input } from 'antd';
import { forwardRef } from 'react';

export const TextWidgetComponent = forwardRef<HTMLDivElement>(
  function TextWidgetComponent(_props, ref) {
    const widgetView = useInject<TextWidget>(ViewInstance);
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
export class TextWidget extends WidgetView {
  override view = TextWidgetComponent;
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
