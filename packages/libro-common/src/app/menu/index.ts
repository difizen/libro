import type { MenuPath } from '../../core/index.js';
import { ManaModule } from '../../core/index.js';

import { Menu, MenuFactory, MenuPathSymbol } from './menu.js';
import 'rc-tooltip/assets/bootstrap.css';
import { MenuColorRegistry } from './menu-color-registry.js';

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

export * from './menu.js';
export * from './menu-render.js';
export * from './menu-bar-render.js';
export * from './menu-protocol.js';
