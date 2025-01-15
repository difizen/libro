/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  MenuRegistry,
  ActionMenuItem,
  renderNode,
  GeneralMenuItem,
} from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import type { MenuNode, MenuPath, MenuItem } from '@difizen/mana-app';
import { Menubar, Menu } from '@difizen/mana-react';
import * as React from 'react';
import type { ReactNode } from 'react';

export interface MenuProps {
  path?: MenuPath;
}

export interface MenuItemProps {
  node: MenuItem;
}

export const ManaMenubar = (props: MenuProps) => {
  const { path = [] } = props;
  const menu = useInject(MenuRegistry);
  const node = menu.getMenu(path);
  const renderMenuItem = (menuNode: MenuNode): JSX.Element | React.ReactFragment => {
    if (ActionMenuItem.is(menuNode)) {
      return <Menu.Item key={menuNode.id}>{menuNode.label as ReactNode}</Menu.Item>;
    }
    if (GeneralMenuItem.is(menuNode)) {
      if (menuNode.isSubmenu) {
        return (
          <Menu.SubMenu key={menuNode.id} text={menuNode.label as ReactNode}>
            {renderMenuList(menuNode.children, true)}
          </Menu.SubMenu>
        );
      }
      return renderMenuList(menuNode.children, true);
    }
    return <Menu.Item key={menuNode.id}>{menuNode.label as ReactNode}</Menu.Item>;
  };

  const renderMenuList = (list: readonly MenuItem[], inMenu = false) => {
    const childNodes: React.ReactNode[] = [];
    list.forEach((child, index) => {
      if (GeneralMenuItem.is(child)) {
        if (index !== 0) {
          childNodes.push(<Menu.Divider key={`${child.id}-divider`} />);
        }
      } else if (list[index - 1] && GeneralMenuItem.is(list[index - 1])) {
        childNodes.push(<Menu.Divider key={`${list[index].id}-divider`} />);
      }
      childNodes.push(renderMenuItem(child));
    });
    if (inMenu) {
      return childNodes;
    }
    return <Menu>{childNodes}</Menu>;
  };
  return (
    <Menubar>
      {GeneralMenuItem.is(node) &&
        node.children.map((child) => {
          if (GeneralMenuItem.is(child)) {
            return (
              <Menubar.Item key={child.id} text={(child.label as ReactNode) || ''}>
                {renderMenuList(child.children)}
              </Menubar.Item>
            );
          }
          return <Menubar.Item key={child.id} text={renderNode(child.label)} />;
        })}
    </Menubar>
  );
};
