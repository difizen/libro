import { MenuItem } from '@difizen/mana-core';
import { useInject } from '@difizen/mana-observable';
import { Menubar } from '@difizen/mana-react';
import type { FC } from 'react';
import React from 'react';

import type { Menu } from './menu';
import type { MenuFactory } from './menu';
import { MenuItemRender } from './menu-item-render';
import type { MenuItemRenderProps } from './menu-protocol';
import { MenuInstance } from './menu-protocol';
import { MenuRender } from './menu-render';

const MenuBarItemRender: FC<MenuItemRenderProps> = (props: MenuItemRenderProps) => {
  const { item, root } = props;
  const menu = useInject<Menu>(MenuInstance);
  let children: MenuItem[] = [];
  if (MenuItem.isGeneralMenuItem(item)) {
    children = item.children;
  }
  if (root) {
    return (
      <Menubar>
        {children.sort(menu.sort).map((child) => {
          if (MenuItem.isGeneralMenuItem(child)) {
            return (
              <Menubar.Item key={child.key} text={child.renderTitle()}>
                {menu.renderMenuList(child.children)}
              </Menubar.Item>
            );
          }
          return <Menubar.Item key={child.key} text={child.renderTitle()} />;
        })}
      </Menubar>
    );
  } else {
    return <MenuItemRender {...props} />;
  }
};

export interface MenuBarRenderProps {
  data?: any[];
  menuPath: any;
  factory?: MenuFactory;
  menu?: Menu;
}
export const MenuBarRender = React.memo(function MenuBarRender(
  props: MenuBarRenderProps,
) {
  return <MenuRender {...props} data={props.data || []} render={MenuBarItemRender} />;
});
