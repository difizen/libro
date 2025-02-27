import type { FC } from 'react';
import React from 'react';

import { MenuItem } from '../../core/index.js';
import { useInject } from '../../observable/index.js';
import { Menubar } from '../../react/index.js';

import type { Menu } from './menu.js';
import type { MenuFactory } from './menu.js';
import { MenuItemRender } from './menu-item-render.js';
import type { MenuItemRenderProps } from './menu-protocol.js';
import { MenuInstance } from './menu-protocol.js';
import { MenuRender } from './menu-render.js';

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
