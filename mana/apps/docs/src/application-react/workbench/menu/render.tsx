import {
  MenuRegistry,
  GeneralMenuItem,
  ActionMenuItem,
  CommandRegistry,
} from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import type { MenuNode, MenuPath, MenuItem } from '@difizen/mana-app';
import { Menu } from 'antd';
import type { ReactNode } from 'react';

export interface MenuProps {
  path?: MenuPath;
  mode?: MenuNode;
}

export interface MenuItemProps {
  node: MenuItem;
}

export const MenuRender = (props: MenuProps) => {
  const { path = [], mode } = props;
  const menu = useInject(MenuRegistry);
  const command = useInject(CommandRegistry);
  const node = menu.getMenu(path);
  const renderMenuItem = (menuNode: MenuNode) => {
    const renderMenuList = (list: readonly MenuNode[]) => {
      return list.map((child) => {
        if (GeneralMenuItem.is(child)) {
          return renderMenuItem(child);
        }
        if (ActionMenuItem.is(child)) {
          return <Menu.Item key={child.id}>{child.label as ReactNode}</Menu.Item>;
        }
        return null;
      });
    };
    if (GeneralMenuItem.is(menuNode)) {
      if (menuNode.isSubmenu) {
        return (
          <Menu.SubMenu key={menuNode.id} title={menuNode.label as ReactNode}>
            {renderMenuList(menuNode.children)}
          </Menu.SubMenu>
        );
      }
      return (
        <Menu.ItemGroup key={menuNode.id} title={menuNode.label as ReactNode}>
          {renderMenuList(menuNode.children)}
        </Menu.ItemGroup>
      );
    }
    if (ActionMenuItem.is(menuNode)) {
      return <Menu.Item key={menuNode.id}>{menuNode.label as ReactNode}</Menu.Item>;
    }
    return <Menu.Item key={menuNode.id}>{menuNode.label as ReactNode}</Menu.Item>;
  };
  return (
    <Menu
      className={'user-menu-render'}
      selectedKeys={[]}
      onClick={(e) => {
        command.executeCommand(e.key);
      }}
      mode={mode as any}
    >
      {GeneralMenuItem.is(node) && node.children.map((child) => renderMenuItem(child))}
    </Menu>
  );
};
