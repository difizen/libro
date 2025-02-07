import { view, ViewManager, ViewOption } from '@difizen/mana-core';
import type { TabsProps } from '@difizen/mana-react';
import { inject, transient } from '@difizen/mana-syringe';
import cls from 'classnames';

import type { TabOption } from './tab-view';
import { TabSlotView } from './tab-view';

export interface CardTabOption extends TabOption {
  tabPosition?: TabsProps['tabPosition'];
}

@transient()
@view('card-tab-view')
export class CardTabView extends TabSlotView {
  protected override option: CardTabOption;
  constructor(
    @inject(ViewOption) option: CardTabOption,
    @inject(ViewManager) manager: ViewManager,
  ) {
    super(option, manager);
    this.option = option;
    this.id = `card-${this.id}`;
    this.className = cls('card-tab-view', this.className);
  }
  override getTabProps(): TabsProps {
    const baseProps = super.getTabProps();
    return {
      ...baseProps,
      type: 'card',
      tabPosition: this.option.tabPosition || 'top',
    };
  }
}
