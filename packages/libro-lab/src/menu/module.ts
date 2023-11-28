import { createSlotPreference, HeaderArea, ManaModule } from '@difizen/mana-app';

import { MenuBarView } from './menu-bar-view.js';
import { HeaderMenu } from './menu-contribution.js';

export const LibroLabHeaderMenuModule = ManaModule.create().register(
  HeaderMenu,
  MenuBarView,
  createSlotPreference({
    slot: HeaderArea.middle,
    view: MenuBarView,
  }),
);
