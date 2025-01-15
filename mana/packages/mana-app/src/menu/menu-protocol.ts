import type { MenuPath, MenuItem } from '@difizen/mana-core';

export const MAIN_MENU_BAR: MenuPath = ['menubar'];

export const SETTINGS_MENU: MenuPath = ['settings_menu'];
export const ACCOUNTS_MENU: MenuPath = ['accounts_menu'];
export const ACCOUNTS_SUBMENU = [...ACCOUNTS_MENU, '1_accounts_submenu'];
export const MenuInstance = Symbol('MenuInstance');

export interface MenuItemRenderProps {
  item: MenuItem;
  root: boolean;
}

export type MenuData = any | any[];

export interface MenuItemState {
  id: string;
  enable: boolean;
  visible: boolean;
  active: boolean;
}
