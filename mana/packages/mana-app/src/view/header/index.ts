import { ManaModule, createSlotPreference } from '@difizen/mana-core';
import { HeaderView, HeaderArea } from './header-view';
import { FlexSlotView } from '../flex';

export * from './header-view';

export const HeaderModule = ManaModule.create().register(
  HeaderView,
  createSlotPreference({
    slot: HeaderArea.right,
    view: FlexSlotView,
    options: { sort: true },
  }),
  createSlotPreference({
    slot: HeaderArea.left,
    view: FlexSlotView,
    options: { sort: true },
  }),
  createSlotPreference({
    slot: HeaderArea.middle,
    view: FlexSlotView,
    options: { sort: true },
  }),
);
