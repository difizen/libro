import { createViewPreference, ManaModule } from '@difizen/mana-app';
import { HeaderArea } from '@difizen/mana-app';
import { Priority } from '@difizen/mana-app';

import { StorageViewSwitchView } from './storage-view/index.js';
import { ThemeSelectView } from './theme-select-view/index.js';

export const ThemeSwitcherModule = ManaModule.create().register(
  ThemeSelectView,
  createViewPreference({
    view: ThemeSelectView,
    autoCreate: true,
    slot: HeaderArea.right,
    priority: Priority.DEFAULT,
    openOptions: {
      order: 'a1',
    },
  }),
  StorageViewSwitchView,
  createViewPreference({
    view: StorageViewSwitchView,
    autoCreate: true,
    slot: HeaderArea.right,
    priority: Priority.DEFAULT,
    openOptions: {
      order: 'a2',
    },
  }),
);
