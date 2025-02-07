import { ManaModule } from '../module';

import { DefaultActionMenuItem, DefaultGeneralMenuItem } from './default-menu-node';
import type { MenuNode } from './menu-protocol';
import { GeneralMenuItemFactory } from './menu-protocol';
import { ActionMenuItemFactory } from './menu-protocol';
import { MenuSymbol } from './menu-protocol';
import { MenuRegistry, MenuContribution } from './menu-registry';

export const MenuModule = ManaModule.create()
  .contribution(MenuContribution)
  .register(MenuRegistry, DefaultGeneralMenuItem, DefaultActionMenuItem)
  .register({
    token: GeneralMenuItemFactory,
    useDynamic: (ctx) => {
      return (item: MenuNode) => {
        const child = ctx.container.createChild();
        child.register({ token: MenuSymbol.MenuNodeSymbol, useValue: item });
        return child.get(DefaultGeneralMenuItem);
      };
    },
  })
  .register({
    token: ActionMenuItemFactory,
    useDynamic: (ctx) => {
      return (item: MenuNode) => {
        const child = ctx.container.createChild();
        child.register({ token: MenuSymbol.ActionMenuNodeSymbol, useValue: item });
        return child.get(DefaultActionMenuItem);
      };
    },
  });
