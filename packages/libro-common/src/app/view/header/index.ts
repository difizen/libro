import { ManaModule, createSlotPreference } from '../../../core/index.js';
import { HeaderView, HeaderArea } from './header-view.js';
import { FlexSlotView } from '../flex/index.js';

export * from './header-view.js';

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
