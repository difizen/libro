import { CloseOutlined } from '@ant-design/icons';
import {
  DefaultSlotView,
  view,
  ViewOption,
  ViewInstance,
  ViewContext,
  ViewManager,
  ViewRender,
} from '@difizen/mana-core';
import type { View, SlotViewOption } from '@difizen/mana-core';
import { useInject } from '@difizen/mana-observable';
import { prop } from '@difizen/mana-observable';
import { Tabs, Dropdown } from '@difizen/mana-react';
import type { TabPaneProps, TabsProps } from '@difizen/mana-react';
import { inject, transient } from '@difizen/mana-syringe';
import classnames from 'classnames';
import type { ReactNode } from 'react';
import { forwardRef } from 'react';
import './index.less';

import { MenuRender } from '../../menu/menu-render';
import { ToolbarRender } from '../../toolbar/toolbar-render';

import { TabBarContextMenu } from './tab-protocol';

export const TabViewComponent = forwardRef<HTMLDivElement, any>(
  function TabViewComponent(_props, containerRef) {
    const viewInstance = useInject<TabSlotView>(ViewInstance);
    const views = viewInstance.children;
    const activeKey = viewInstance.active?.id || '__no_select__';
    return (
      <div
        className={classnames('mana-tab-view-container', viewInstance.className)}
        ref={containerRef}
      >
        <Tabs
          activeKey={activeKey}
          {...viewInstance.getTabProps()}
          tabBarExtraContent={viewInstance.renderTabToolbar()}
        >
          {views.map((item) => (
            <Tabs.TabPane key={item.id} {...viewInstance.getTabPaneProps(item)}>
              {viewInstance.showTabContent ? viewInstance.renderTabContent(item) : null}
            </Tabs.TabPane>
          ))}
        </Tabs>
      </div>
    );
  },
);

const TabSlotViewId = 'tab-view';

type TabProps = Record<string, number | string | boolean | ReactNode | undefined>;

export interface TabOption extends SlotViewOption {
  sort?: boolean;
  showTabContent?: boolean;
  tabProps: TabProps;
}

@transient()
@view(TabSlotViewId)
export class TabSlotView extends DefaultSlotView {
  @prop()
  showTabContent?: boolean | undefined = true;

  override view = TabViewComponent;

  protected override option: TabOption;

  constructor(
    @inject(ViewOption) option: TabOption,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    super(option, viewManager);
    this.option = option;
    this.id = `tab-${this.id}`;
    this.showTabContent = option.showTabContent ?? true;
  }

  onChange = (activeKey: string) => {
    if (activeKey !== this.active?.id) {
      this.showTabContent = true;
      this.active = this.children.find((item) => item.id === activeKey);
    }
  };

  getTabProps(): TabsProps {
    const { tabProps = {} } = this.option;
    return {
      type: 'line',
      hideAdd: true,
      tabPosition: 'left',
      onChange: this.onChange,
      ...tabProps,
    };
  }

  getTabPaneProps(item: View): TabPaneProps {
    if (item.title) {
      const props = {
        tab: this.renderTab(item),
        style: { height: '100%' },
      };
      return props;
    }
    return {
      tab: item.label,
      style: { height: '100%' },
    };
  }
  renderTabContent(item: View) {
    return <ViewRender view={item} />;
  }
  close(item: View) {
    item.dispose();
  }
  protected renderTab(item: View) {
    return (
      <ViewContext view={item}>
        <Dropdown
          trigger={['contextMenu']}
          overlay={<MenuRender menuPath={TabBarContextMenu} data={[item]} />}
        >
          <div
            title={item.title.caption}
            className={classnames('mana-tab-title', item.title.className)}
          >
            {item.title.icon && (
              <span className="mana-tab-icon">
                {this.renderTitleIcon(item.title.icon)}
              </span>
            )}
            {this.renderTitleLabel(item.title.label)}
            {item.title.closable && (
              <CloseOutlined
                onClick={() => this.close(item)}
                className="mana-tab-close"
              />
            )}
          </div>
        </Dropdown>
      </ViewContext>
    );
  }

  renderTabToolbar() {
    return <ToolbarRender data={[this.active, this]} />;
  }
}
