import { ManaModule } from '../module';

import { DefaultActionMenuItem, DefaultGeneralMenuItem } from './default-menu-node';
import type { MenuNode, MenuPath } from './menu-protocol';
import {
  MenuSymbol,
  ActionMenuItemFactory,
  GeneralMenuItemFactory,
} from './menu-protocol';
import { MenuRegistry, MenuContribution } from './menu-registry';

export * from './menu-registry';
export * from './menu-protocol';

export const CoreMenuModule = ManaModule.create()
  .contribution(MenuContribution)
  .register(MenuRegistry, DefaultGeneralMenuItem, DefaultActionMenuItem)
  .register({
    token: GeneralMenuItemFactory,
    useDynamic: (ctx) => {
      return (item: MenuNode, parent: MenuPath) => {
        const child = ctx.container.createChild();
        child.register({ token: MenuSymbol.MenuNodeSymbol, useValue: item });
        child.register({ token: MenuSymbol.ParentPathSymbol, useValue: parent });
        return child.get(DefaultGeneralMenuItem);
      };
    },
  })
  .register({
    token: ActionMenuItemFactory,
    useDynamic: (ctx) => {
      return (item: MenuNode, parent: MenuPath) => {
        const child = ctx.container.createChild();
        child.register({ token: MenuSymbol.ActionMenuNodeSymbol, useValue: item });
        child.register({ token: MenuSymbol.ParentPathSymbol, useValue: parent });
        return child.get(DefaultActionMenuItem);
      };
    },
  });
