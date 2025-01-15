import { ManaModule } from '@difizen/mana-core';

import { Toolbar, ToolbarFactory } from './toolbar';
import 'rc-tooltip/assets/bootstrap.css';
import './index.less';

export const ToolbarModule = ManaModule.create()
  .register(Toolbar)
  .register({
    token: ToolbarFactory,
    useDynamic: (ctx) => {
      return () => {
        const toolbar = ctx.container.get(Toolbar);
        return toolbar;
      };
    },
  });

export * from './toolbar';
export * from './toolbar-render';
