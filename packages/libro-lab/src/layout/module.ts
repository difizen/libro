import {
  createSlotPreference,
  HeaderArea,
  HeaderView,
  ManaModule,
} from '@difizen/mana-app';

import { BrandView } from './brand/index.js';
import { LibroLabLayoutContainerView } from './container.js';
import { EditorTabView } from './editor-tab-view.js';
import { LibroLabLayoutView } from './layout.js';
import { LibroLabLayoutMainView } from './main.js';
import { LibroLabLayoutSlots } from './protocol.js';

export const LibroLabLayoutModule = ManaModule.create('LibroLabLayoutModule').register(
  LibroLabLayoutView,
  LibroLabLayoutContainerView,
  LibroLabLayoutMainView,
  BrandView,
  EditorTabView,
  createSlotPreference({
    slot: LibroLabLayoutSlots.header,
    view: HeaderView,
  }),
  createSlotPreference({
    slot: HeaderArea.left,
    view: BrandView,
  }),
  createSlotPreference({
    slot: LibroLabLayoutSlots.container,
    view: LibroLabLayoutContainerView,
  }),
  createSlotPreference({
    slot: LibroLabLayoutSlots.main,
    view: LibroLabLayoutMainView,
  }),
);
