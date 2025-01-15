import { HeaderArea } from '@difizen/mana-app';
import {
  createViewPreference,
  DefaultSlotView,
  ManaModule,
  view,
} from '@difizen/mana-app';
import { prop, useInject } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';
import { Tabs, Select } from 'antd';

import { AppLayoutArea } from './layout.js';

export const TabsConf = [{ name: 'Tab 1' }, { name: 'Tab 2' }, { name: 'Tab 3' }];

@singleton()
export class ContentModel {
  @prop() active: string = TabsConf[0].name;
  setActive = (active: string) => {
    this.active = active;
  };
}

const ContentView = () => {
  const model = useInject(ContentModel);
  return (
    <Tabs
      activeKey={model.active}
      onChange={model.setActive}
      items={TabsConf.map((item) => ({
        key: item.name,
        label: item.name,
        children: <>Tab Content: {item.name}</>,
      }))}
    ></Tabs>
  );
};

@singleton()
@view('app-content')
export class Content extends DefaultSlotView {
  @inject(ContentModel) model!: ContentModel;
  override view = ContentView;
}

const HeaderSelector = () => {
  const model = useInject(ContentModel);
  return (
    <Select value={model.active} onSelect={model.setActive}>
      {TabsConf.map((item) => {
        return (
          <Select.Option value={item.name} key={item.name}>
            {item.name}
          </Select.Option>
        );
      })}
    </Select>
  );
};

@singleton()
@view('app-header-selector')
export class Selector extends DefaultSlotView {
  override view = HeaderSelector;
}

export const ContentModule = ManaModule.create().register(
  Content,
  ContentModel,
  Selector,
  createViewPreference({
    view: Content,
    slot: AppLayoutArea.content,
    autoCreate: true,
  }),
  createViewPreference({
    view: Selector,
    slot: HeaderArea.right,
    autoCreate: true,
  }),
);
