import { ManaModule } from '../module';

import { DataContextManager } from './data-context-manager';
import { DataContextContriburtion, DataContextSymbol } from './data-context-protocol';

export * from './data-context';
export * from './data-context-manager';
export * from './data-context-protocol';

export const ContextModule = ManaModule.create()
  .contribution(DataContextContriburtion)
  .register(DataContextManager, {
    token: DataContextSymbol,
    useDynamic: (ctx) => ctx,
  });
