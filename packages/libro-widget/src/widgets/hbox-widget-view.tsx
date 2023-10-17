import {
  view,
  ViewOption,
  ViewRender,
  transient,
  useInject,
  ViewInstance,
  inject,
} from '@difizen/mana-app';
import { forwardRef } from 'react';

import type { IWidgetViewProps } from '../base/protocal.js';
import { WidgetView } from '../base/widget-view.js';
import './index.less';
import { LibroWidgets } from '../base/libro-widgets.js';
import { LirboContextKey } from '@difizen/libro-core';

export const HBoxWidgetComponent = forwardRef<HTMLDivElement>(
  function HBoxWidgetComponent() {
    const widgetView = useInject<HBoxWidget>(ViewInstance);
    if (widgetView.isCommClosed) {
      return null;
    }
    const hboxChildrenWidget = widgetView.get_child_model();
    return (
      <div className="libro-hbox-widget">
        {hboxChildrenWidget.map((childrenWidgets) => (
          <ViewRender view={childrenWidgets} key={childrenWidgets.id} />
        ))}
      </div>
    );
  },
);
@transient()
@view('libro-hbox-widget-view')
export class HBoxWidget extends WidgetView {
  override view = HBoxWidgetComponent;
  children: string[];
  layout: string;
  box_style: string;
  override libroWidgets: LibroWidgets;
  constructor(
    @inject(ViewOption) props: IWidgetViewProps,
    @inject(LirboContextKey) lirboContextKey: LirboContextKey,
    @inject(LibroWidgets) libroWidgets: LibroWidgets,
  ) {
    super(props, lirboContextKey);
    this.box_style = props.attributes.bar_style;
    this.layout = props.attributes.layout;
    this.children = props.attributes.children;
    this.lirboContextKey = lirboContextKey;
    this.libroWidgets = libroWidgets;
  }

  get_child_model(): WidgetView[] {
    const childrenWidgets: WidgetView[] = [];
    this.children.forEach((child) => {
      if (this.libroWidgets.hasModel(child.substring(10))) {
        childrenWidgets.push(this.libroWidgets.getModel(child.substring(10)));
      }
    });
    return childrenWidgets;
  }
}
