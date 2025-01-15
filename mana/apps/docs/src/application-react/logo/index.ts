import { createViewPreference, ManaModule } from '@difizen/mana-app';
import { HeaderArea } from '@difizen/mana-app';
import { Priority } from '@difizen/mana-app';

import { LogoView } from './logo-view.js';

export const LogoModule = ManaModule.create().register(
  LogoView,
  createViewPreference({
    view: LogoView,
    autoCreate: true,
    slot: HeaderArea.left,
    priority: Priority.DEFAULT,
  }),
);
