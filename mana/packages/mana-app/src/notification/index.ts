import { ManaModule } from '@difizen/mana-core';

import { NotificationService } from './service';

export const NotificationModule = ManaModule.create().register(NotificationService);

export * from './protocol';
export * from './service';
