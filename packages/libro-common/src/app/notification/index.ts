import { ManaModule } from '../../core/index.js';

import { NotificationService } from './service.js';

export const NotificationModule = ManaModule.create().register(NotificationService);

export * from './protocol.js';
export * from './service.js';
