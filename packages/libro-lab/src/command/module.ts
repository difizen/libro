import { createSlotPreference, HeaderArea, ManaModule } from '@difizen/mana-app';

import { LabMenu } from './lab-menu-contribution.js';
import { MenuBarView } from './menu-bar-view.js';

export const LibroLabHeaderMenuModule = ManaModule.create().register(
  LabMenu,
  MenuBarView,
  createSlotPreference({
    slot: HeaderArea.middle,
    view: MenuBarView,
  }),
);
