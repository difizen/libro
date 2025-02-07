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
import { inject, transient } from '@difizen/mana-syringe';
import cls from 'classnames';
import React from 'react';
import './index.less';

export interface FlexOption extends SlotViewOption {
  sort?: boolean;
}

export const FlexViewComponent = React.forwardRef(function FlexViewComponent(
  _props,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const instance = useInject<FlexSlotView>(ViewInstance);
  const children = instance.children;
  return (
    <div className={cls('mana-flex', instance.className)} ref={ref}>
      {children.map((item) => (
        <div className={'mana-flex-item'} key={item.id}>
          <ViewRender view={item} />
        </div>
      ))}
    </div>
  );
});

@transient()
@view('flex-view')
export class FlexSlotView extends DefaultSlotView {
  override label: React.ReactNode = null;
  override view = FlexViewComponent;

  @prop()
  override sort: boolean | undefined = false;

  protected override option: FlexOption;

  constructor(
    @inject(ViewOption) option: FlexOption,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    super(option, viewManager);
    this.option = option;
    this.id = `flex-${this.id}`;
    this.sort = option.sort;
  }
}
