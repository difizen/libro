import {
  createSlotPreference,
  createViewPreference,
  ManaModule,
} from '@difizen/mana-app';
import { CardTabView } from '@difizen/mana-app';

import { WorkbenchLayoutArea } from '../workbench/layout/workbench-layout.js';

import { CommandPaletteApplication } from './command-palette-app.js';
import { CommandPaletteView, CommandSlot } from './command-palette-view.js';
import { CommandTabView } from './command-tab.js';

export const CommandPalette = ManaModule.create().register(
  CommandPaletteView,
  CommandPaletteApplication,
  CommandTabView,
  createViewPreference({
    view: CommandPaletteView,
    slot: WorkbenchLayoutArea.left,
    autoCreate: true,
  }),
  createSlotPreference({
    slot: CommandSlot.first,
    view: CardTabView,
  }),
  createViewPreference({
    view: CommandTabView,
    slot: CommandSlot.first,
    autoCreate: true,
  }),
);
