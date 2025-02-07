import { ApplicationContribution, localStorageService } from '../mana-core/index.js';
import { inject, singleton } from '../mana-syringe/index.js';

import { NotificationService } from './notification/service';

@singleton({ contrib: [ApplicationContribution] })
export class ManaApplication implements ApplicationContribution {
  @inject(NotificationService) notificationService: NotificationService;
  initialize() {
    localStorageService.onDiskQuotaExceeded(() => {
      const toDispose = this.notificationService.info({
        message: '浏览器缓存已满',
        description: <div>是否现在清理</div>,
        actions: [{ key: 'confirm', label: '确认' }],
        onAction: () => {
          localStorage.clear();
          toDispose.dispose();
        },
        duration: null,
      });
    });
  }
}
