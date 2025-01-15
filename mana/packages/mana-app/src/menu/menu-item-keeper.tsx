import { CommandRegistry, MenuItem } from '@difizen/mana-core';
import { observable, useObserve } from '@difizen/mana-observable';
import { useInject } from '@difizen/mana-observable';
import { memo } from 'react';

import type { Menu } from './menu';
import type { MenuData, MenuItemState } from './menu-protocol';

interface ToolbarItemKeeperProps {
  data: MenuData;
  item: MenuItem;
  menu: Menu;
}
const MenuItemKeeperInner = (props: ToolbarItemKeeperProps) => {
  const commands = useInject(CommandRegistry);
  const item = useObserve(props.item);
  const menu = useObserve(props.menu);
  let data = useObserve(props.data);
  if (!Array.isArray(data)) {
    data = [data];
  }
  if (MenuItem.isGeneralMenuItem(item)) {
    return (
      <>
        {item.children.map((child) => {
          return <MenuItemKeeperInner key={child.id} {...props} item={child} />;
        })}
      </>
    );
  }
  if (MenuItem.isActionMenuItem(item)) {
    const handleState = (...args: any[]): MenuItemState => {
      const visible = commands.isVisibleByHandler(item, item.command!, ...args);
      let enable = false;
      let active = false;
      if (visible) {
        enable = commands.isEnabledByHandler(item, item.command!, ...args);
        active = commands.isActiveByHandler(item, item.command!, ...args);
      }
      return { id: item.id, visible, enable, active };
    };
    const newState = handleState(...data);
    const currentState = menu.getState(item);
    if (currentState) {
      const observableState = observable(currentState);
      observableState.visible = !!newState?.visible;
      observableState.enable = !!newState?.enable;
      observableState.active = !!newState?.active;
    } else {
      menu.setState(newState);
    }
  }
  return null;
};
export const MenuItemKeeper = memo(MenuItemKeeperInner);
