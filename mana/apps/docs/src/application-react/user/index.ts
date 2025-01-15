import { createViewPreference, ManaModule } from '@difizen/mana-app';
import { HeaderArea } from '@difizen/mana-app';
import { Priority } from '@difizen/mana-app';

import { UserAvatarView } from './user-avatar-view/index.js';

export const UerModule = ManaModule.create().register(
  UserAvatarView,
  createViewPreference({
    view: UserAvatarView,
    autoCreate: true,
    slot: HeaderArea.right,
    priority: Priority.DEFAULT,
    openOptions: {
      order: 'a0',
    },
  }),
);
