import { ManaModule } from '@difizen/mana-core';

import { EnhancerModule } from './enhancers';

export * from './enhancers';

export const ManaUIModule = ManaModule.create().dependOn(EnhancerModule);
