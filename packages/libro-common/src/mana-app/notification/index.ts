import { ManaModule } from '../../core/index.js';

import { NotificationService } from './service';

export const NotificationModule = ManaModule.create().register(NotificationService);

export * from './protocol';
export * from './service';
