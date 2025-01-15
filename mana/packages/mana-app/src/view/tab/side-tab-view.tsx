import type { View } from '@difizen/mana-core';
import { ViewRender } from '@difizen/mana-core';
import { ViewManager } from '@difizen/mana-core';
import { view, ViewOption, ViewContext } from '@difizen/mana-core';
import { equals, prop } from '@difizen/mana-observable';
import type { TabsProps } from '@difizen/mana-react';
import { inject, transient } from '@difizen/mana-syringe';
import cls from 'classnames';

import { ToolbarRender } from '../../toolbar/toolbar-render';

import type { TabOption } from './tab-view';
import { TabSlotView } from './tab-view';

export interface SideTabOption extends TabOption {
  tabPosition?: TabsProps['tabPosition'];
  showTitle?: boolean;
  activeToggable?: boolean;
  contentToggable?: boolean;
}

@transient()
@view('side-tab-view')
export class SideTabView extends TabSlotView {
  @prop() showTitle: boolean;
  protected override option: SideTabOption;
  constructor(
    @inject(ViewOption) option: SideTabOption,
    @inject(ViewManager) manager: ViewManager,
  ) {
    super(option, manager);
    this.option = option;
    this.id = `side-${this.id}`;
    this.className = cls('mana-side-tab-view', this.className);
    this.showTitle = option.showTitle ?? true;
  }

  onTabClick = (key: string) => {
    if (this.active?.id === key) {
      const active = this.option.activeToggable ? undefined : this.active;
      const showTabContent = this.option.contentToggable
        ? !this.showTabContent
        : !!this.active;
      this.showTabContent = active && showTabContent;
      setTimeout(() => {
        if (active !== this.active) {
          this.active = active;
        }
      }, 0);
    }
  };

  override getTabProps(): TabsProps {
    const baseProps = super.getTabProps();
    return {
      ...baseProps,
      tabPosition: this.option.tabPosition || 'left',
      onTabClick: this.onTabClick,
    };
  }

  protected override renderTab(item: View) {
    return (
      <ViewContext view={item}>
        <div
          title={item.title.caption}
          className={cls('mana-tab-side-title', item.title.className)}
        >
          <span className="mana-tab-icon">{this.renderTitleIcon(item.title.icon)}</span>
        </div>
      </ViewContext>
    );
  }
  override renderTabContent(item: View): JSX.Element {
    return (
      <div className="mana-tab-side-pane">
        {this.showTitle && (
          <div className="mana-tab-side-pane-header">
            <ViewContext view={item}>
              {this.renderTitleLabel(item.title.label)}
            </ViewContext>
            {equals(this.active, item) && <ToolbarRender data={item} />}
          </div>
        )}
        <div className="mana-tab-side-pane-content">
          <ViewRender view={item} />
        </div>
      </div>
    );
  }

  override renderTabToolbar() {
    return <></>;
  }
}
