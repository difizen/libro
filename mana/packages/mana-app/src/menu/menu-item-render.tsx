import { useObserve, useInject } from '@difizen/mana-observable';
import React from 'react';

import type { Menu } from './menu';
import type { MenuItemRenderProps } from './menu-protocol';
import { MenuInstance } from './menu-protocol';

export const MenuItemRender = React.memo(function MenuItemRender(
  props: MenuItemRenderProps,
) {
  const { root } = props;
  const menu = useInject<Menu>(MenuInstance);
  const item = useObserve(props.item);
  return <>{menu.renderMenuItem(item, root)}</>;
});
