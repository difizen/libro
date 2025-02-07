import { useObserve, useInject } from '../../observable/index.js';
import React from 'react';

import type { Menu } from './menu.js';
import type { MenuItemRenderProps } from './menu-protocol.js';
import { MenuInstance } from './menu-protocol.js';

export const MenuItemRender = React.memo(function MenuItemRender(
  props: MenuItemRenderProps,
) {
  const { root } = props;
  const menu = useInject<Menu>(MenuInstance);
  const item = useObserve(props.item);
  return <>{menu.renderMenuItem(item, root)}</>;
});
