import type { MenuPath } from '@difizen/mana-core';
import { ManaModule } from '@difizen/mana-core';

import { Menu, MenuFactory, MenuPathSymbol } from './menu';
import 'rc-tooltip/assets/bootstrap.css';
import { MenuColorRegistry } from './menu-color-registry';

export const MenuModule = ManaModule.create()
  .register(Menu, MenuColorRegistry)
  .register({
    token: MenuFactory,
    useDynamic: (ctx) => {
      return (menuPath: MenuPath) => {
        const child = ctx.container.createChild();
        child.register({ token: MenuPathSymbol, useValue: menuPath });
        return child.get(Menu);
      };
    },
  });

export * from './menu';
export * from './menu-render';
export * from './menu-bar-render';
export * from './menu-protocol';
