import type { Event, Disposable } from '@difizen/mana-common';
import { DisposableCollection, Emitter } from '@difizen/mana-common';
import type { GeneralMenuItem, ActionMenuItem, MenuPath } from '@difizen/mana-core';
import { MenuItem } from '@difizen/mana-core';
import { CommandRegistry, MenuRegistry } from '@difizen/mana-core';
import { prop } from '@difizen/mana-observable';
import { Menu as MenuComponent } from '@difizen/mana-react';
import { inject, transient } from '@difizen/mana-syringe';

import { MenuItemRender } from './menu-item-render';
import type { MenuData, MenuItemState } from './menu-protocol';

export const MenuPathSymbol = Symbol('MenuPathSymbol');

/**
 * Factory for instantiating toolbars.
 */
export const MenuFactory = Symbol('ToolbarFactory');

export interface MenuFactory {
  (menuPath: MenuPath): Menu;
}

/**
 * The toolbar manager, a toolbar instance should be created with view.
 */
@transient()
export class Menu implements Disposable {
  protected toDispose = new DisposableCollection();
  protected _disposed = false;
  get disposed() {
    return this._disposed;
  }

  protected disposedEventEmitter: Emitter<void> = new Emitter();
  onDisposed: Event<void> = this.disposedEventEmitter.event;

  @prop()
  current: any;

  @prop()
  states: Map<string, MenuItemState> = new Map<string, MenuItemState>();

  @prop()
  root: GeneralMenuItem;

  protected readonly commands: CommandRegistry;
  protected readonly menus: MenuRegistry;
  protected readonly menuPath: MenuPath;

  constructor(
    @inject(CommandRegistry)
    commands: CommandRegistry,
    @inject(MenuRegistry)
    menus: MenuRegistry,
    @inject(MenuPathSymbol) menuPath: MenuPath,
  ) {
    this.commands = commands;
    this.menus = menus;
    this.menuPath = menuPath;
    this.menuPath = menuPath;
    this.root = this.menus.getMenu(this.menuPath);
  }

  setCurrent(current: any): void {
    this.current = current;
  }

  sort = (left: MenuItem, right: MenuItem) => {
    const leftOrder = left.order ?? left.id;
    const rightOrder = right.order ?? right.id;
    return leftOrder.localeCompare(rightOrder);
  };

  protected commandIsEnabled(command: string): boolean {
    return this.commands.isEnabled(command, this.current);
  }

  execute(item: ActionMenuItem, data: MenuData = this.current) {
    if (this.states.get(item.id)?.enable) {
      let args = data;
      if (!Array.isArray(data)) {
        args = [data];
      }
      return this.commands.executeCommandByHandler(item, item.command!, ...args);
    }
    return undefined;
  }

  setState = (item: MenuItemState) => {
    this.states.set(item.id, item);
  };

  getState = (item: MenuItemState | MenuItem) => {
    const currentState = this.states.get(item.id);
    return currentState;
  };

  removeItemState(key: string) {
    this.states.delete(key);
  }

  protected isGroup(item: MenuItem): boolean {
    return MenuItem.isGeneralMenuItem(item) && !item.isSubmenu;
  }

  protected doRenderList(list: readonly MenuItem[]): React.ReactNode {
    const childNodes: React.ReactNode[] = [];
    let lastItemIsDivider = false;
    for (let index = 0; index < list.length; index++) {
      const child = list[index];
      if (MenuItem.isGeneralMenuItem(child)) {
        if (this.isGroup(child)) {
          if (index > 0 && !lastItemIsDivider) {
            childNodes.push(
              <MenuComponent.Divider key={`${child.id}-divider-before`} />,
            );
            lastItemIsDivider = true;
          }
          const visibleChildren = child.children.filter((item) => this.isVisible(item));
          if (visibleChildren.length === 0) {
            continue;
          }
          const children = this.renderMenuList(
            [...visibleChildren].sort(this.sort),
            true,
          );
          if (children instanceof Array) {
            childNodes.push(...children);
          } else {
            childNodes.push(children);
          }
          lastItemIsDivider = false;
          if (
            index < list.length - 1 &&
            !this.isGroup(list[index + 1]) &&
            !lastItemIsDivider
          ) {
            childNodes.push(
              <MenuComponent.Divider key={`${child.id}-divider-after`} />,
            );
            lastItemIsDivider = true;
          }
          continue;
        }
      }
      childNodes.push(<MenuItemRender key={child.id} item={child} root={false} />);
      lastItemIsDivider = false;
    }
    return childNodes;
  }

  renderMenuList = (list: readonly MenuItem[], inMenu = false): React.ReactNode => {
    const childNodes = this.doRenderList(list);
    if (inMenu) {
      return childNodes;
    }
    return <MenuComponent>{childNodes}</MenuComponent>;
  };

  renderMenuItem(item: MenuItem, root = false) {
    let content = null;
    if (MenuItem.isGeneralMenuItem(item)) {
      const sorted = [...item.children].sort(this.sort);
      if (item.isSubmenu) {
        content = (
          <MenuComponent.SubMenu key={item.id} text={item.renderTitle()}>
            {this.renderMenuList(sorted, true)}
          </MenuComponent.SubMenu>
        );
      } else {
        content = this.renderMenuList(sorted, true);
      }
    }

    if (MenuItem.isActionMenuItem(item)) {
      if (!this.isVisible(item)) {
        return null;
      }
      return (
        <MenuComponent.Item
          disabled={!this.isEnable(item)}
          icon={item.renderIcon()}
          onClick={() => {
            this.execute(item);
          }}
          key={item.id}
        >
          {item.renderTitle()}
        </MenuComponent.Item>
      );
    }

    if (root) {
      return <MenuComponent>{content}</MenuComponent>;
    }
    return content;
  }

  dispose(): void {
    this.states.clear();
    this.toDispose.dispose();
    this._disposed = true;
  }

  isVisible(item: MenuItem): boolean {
    return this.states.get(item.id)?.visible ?? false;
  }
  isEnable(item: MenuItem): boolean {
    return this.states.get(item.id)?.enable ?? false;
  }
}
