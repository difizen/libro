import {
  DefaultSlotView,
  view,
  ViewManager,
  ViewOption,
  ViewRender,
} from '@difizen/mana-core';
import { ViewInstance } from '@difizen/mana-core';
import type { SlotViewOption } from '@difizen/mana-core';
import { prop, useInject } from '@difizen/mana-observable';
import { BoxPanel } from '@difizen/mana-react';
import { inject, transient } from '@difizen/mana-syringe';
import React from 'react';

type Direction = 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';
export interface BoxOption extends SlotViewOption {
  sort?: boolean;
  direction?: Direction;
}

export const BoxViewComponent = React.forwardRef(function BoxViewComponent(
  _props,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const instance = useInject<BoxSlotView>(ViewInstance);
  const children = instance.children;
  return (
    <BoxPanel
      direction={instance.direction}
      className={instance.className || ''}
      ref={ref}
    >
      {children.map((item) => (
        <BoxPanel.Pane flex={1} key={item.id}>
          <ViewRender view={item} />
        </BoxPanel.Pane>
      ))}
    </BoxPanel>
  );
});

@transient()
@view('box-panel-view')
export class BoxSlotView extends DefaultSlotView {
  override label: React.ReactNode = null;
  override view = BoxViewComponent;

  @prop()
  override sort: boolean | undefined = false;

  @prop()
  direction: Direction = 'left-to-right';

  protected override option: BoxOption;

  constructor(
    @inject(ViewOption) option: BoxOption,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    super(option, viewManager);
    this.option = option;
    this.id = `box-${this.id}`;
    this.sort = option.sort;
    this.direction = option.direction || 'left-to-right';
  }
}
