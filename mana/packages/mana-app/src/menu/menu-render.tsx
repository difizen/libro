import type { MenuPath } from '@difizen/mana-core';
import { useInject, ObservableContext } from '@difizen/mana-observable';
import type { Syringe } from '@difizen/mana-syringe';
import type { FC } from 'react';
import { memo, useEffect, useState, useContext, useMemo } from 'react';

import { MenuFactory } from './menu';
import type { Menu } from './menu';
import { MenuContext } from './menu-context';
import { MenuItemKeeper } from './menu-item-keeper';
import { MenuItemRender } from './menu-item-render';
import { MenuInstance } from './menu-protocol';
import type { MenuItemRenderProps, MenuData } from './menu-protocol';

export interface MenuRenderProps {
  /**
   * menu 的路径
   */
  menuPath: MenuPath;
  /**
   * 传递已经存在的 menu 实例
   */
  menu?: Menu;
  /**
   * 参数
   * @description menu 传递的参数
   */
  data: MenuData;
  /**
   * 工厂函数
   * @description 获取 menu 实例的工厂函数，用于自定义
   */
  factory?: MenuFactory;

  render?: FC<MenuItemRenderProps>;
}

export const useChildContainer = () => {
  const context = useContext(ObservableContext);
  const container = context.getContainer();
  const childContainer = useMemo(() => {
    return container?.createChild() as Syringe.Container;
  }, [container]);
  return childContainer || container;
};
export const MenuRender = memo(function MenuRender(props: MenuRenderProps) {
  const { data, factory, menuPath } = props;
  const Render = props.render || MenuItemRender;
  const defaultFactory = useInject<MenuFactory>(MenuFactory);
  const currentFactory = factory || defaultFactory;
  const [menu, setMenu] = useState<Menu | undefined>(props.menu);
  const [contextReady, setContextReady] = useState<boolean>(false);

  const childContainer = useChildContainer();

  useEffect(() => {
    if (!props.menu) {
      const newMenu = currentFactory(menuPath);
      setMenu(newMenu);
      childContainer.register({
        token: MenuInstance,
        useValue: newMenu,
      });
    } else {
      setMenu(props.menu);
    }
  }, [childContainer, currentFactory, props.menu, menuPath]);

  useEffect(() => {
    if (menu && !menu.disposed) {
      menu.setCurrent(data);
      setContextReady(true);
    }
    return () => {
      setContextReady(false);
    };
  }, [childContainer, data, menu]);

  if (!menu || !contextReady) {
    return null;
  }

  return (
    <ObservableContext.Provider value={{ getContainer: () => childContainer }}>
      {/* 兼容旧的处理方式 */}
      <MenuContext.Provider value={{ menu, data }}>
        <MenuItemKeeper data={data} item={menu.root} menu={menu} />
        <Render item={menu.root} root />
      </MenuContext.Provider>
    </ObservableContext.Provider>
  );
});
