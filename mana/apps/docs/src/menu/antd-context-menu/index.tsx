import type { MenuItemRenderProps, Menu as ManaMenu } from '@difizen/mana-app';
import { ManaModule } from '@difizen/mana-app';
import {
  ManaAppPreset,
  useInject,
  ManaComponents,
  MAIN_MENU_BAR,
  MenuItem,
  MenuInstance,
  MenuRender,
} from '@difizen/mana-app';
import { Menu, Dropdown } from 'antd';
import type { ItemType } from 'antd/es/menu/interface.js';
import type { MenuProps } from 'antd/lib/menu';

import { Menus, Model } from './menu.js';

export const BaseModule = ManaModule.create().register(Menus, Model);

const MenuItemToProps = (item: MenuItem, menu: ManaMenu): ItemType | undefined => {
  if (MenuItem.isGeneralMenuItem(item)) {
    let children: ItemType[] = [];
    if (item.children) {
      children = [...item.children]
        .sort(menu.sort)
        .map((child) => MenuItemToProps(child, menu))
        .filter((i): i is ItemType => !!i);
    }
    if (children.filter((i) => !!i).length === 0) {
      return undefined;
    }
    if (item.isSubmenu) {
      return {
        key: item.key,
        label: item.renderTitle(),
        icon: item.renderIcon(),
        children,
      };
    } else {
      return {
        key: item.key,
        label: item.renderTitle(),
        type: 'group',
        children,
      };
    }
  }
  if (MenuItem.isActionMenuItem(item)) {
    if (!menu.isVisible(item)) {
      return undefined;
    }
    return {
      key: item.key,
      label: item.renderTitle(),
      icon: item.renderIcon(),
      disabled: !menu.isEnable(item),
      onClick: () => menu.execute(item),
    };
  }
  return undefined;
};

const MenuItemRender = (props: MenuItemRenderProps) => {
  const { item, root } = props;
  const menu = useInject<ManaMenu>(MenuInstance);
  if (!root || !MenuItem.isGeneralMenuItem(item)) {
    return null;
  }
  const menuProps: MenuProps['items'] = [...item.children]
    .sort(menu.sort)
    .map((i) => MenuItemToProps(i, menu))
    .filter((i): i is ItemType => !!i);

  return (
    <Dropdown menu={{ items: menuProps }} trigger={['contextMenu']}>
      <div>
        <Menu mode="inline" items={menuProps} />
      </div>
    </Dropdown>
  );
};

const App = (): JSX.Element => {
  return (
    <ManaComponents.Application
      asChild={true}
      modules={[ManaAppPreset, BaseModule]}
      renderChildren
    >
      <MenuRender data={[]} menuPath={MAIN_MENU_BAR} render={MenuItemRender} />
    </ManaComponents.Application>
  );
};

export default App;
