import { ManaModule } from '../module';

import { DefaultToolbarItem } from './default-toolbar-item';
import { ToolbarNode, ToolbarItemFactory } from './toolbar-protocol';
import { ToolbarRegistry, ToolbarContribution } from './toolbar-registry';

export const CoreToolbarModule = ManaModule.create()
  .contribution(ToolbarContribution)
  .register(DefaultToolbarItem, ToolbarRegistry)
  .register({
    token: ToolbarItemFactory,
    useDynamic: (ctx) => {
      return (item: ToolbarNode) => {
        const child = ctx.container.createChild();
        child.register({ token: ToolbarNode, useValue: item });
        return child.get(DefaultToolbarItem);
      };
    },
  });

export * from './toolbar-protocol';
export * from './toolbar-registry';
export * from './default-toolbar-item';
