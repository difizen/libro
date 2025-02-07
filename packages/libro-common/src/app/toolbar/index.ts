import { ManaModule } from '../../core/index.js';

import { Toolbar, ToolbarFactory } from './toolbar.js';
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

export * from './toolbar.js';
export * from './toolbar-render.js';
