import {
  createSlotPreference,
  FlexSlotView,
  HeaderArea,
  HeaderView,
  ManaModule,
} from '@difizen/mana-app';

import { BrandView } from './brand/brand.js';
import { LibroLabLayoutContainerView } from './container.js';
import { ContentBottomTabView } from './content-bottom-tab-view.js';
import { LibroLabCurrentFileFooterView } from './footer/current-file-footer-view.js';
import { FooterArea, LibroLabLayoutFooterView } from './footer/footer-view.js';
import { LibroLabStatusFooterView } from './footer/status-footer-view.js';
import { LayoutService } from './layout-service.js';
import { LibroLabLayoutView } from './layout.js';
import { LibroLabLayoutMainView } from './main.js';
import { LibroLabLayoutSlots } from './protocol.js';
import { SaveableTabView } from './saveable-tab-view.js';

export const LibroLabLayoutModule = ManaModule.create('LibroLabLayoutModule').register(
  LibroLabLayoutView,
  LibroLabLayoutContainerView,
  LibroLabLayoutMainView,
  BrandView,
  SaveableTabView,
  ContentBottomTabView,
  LibroLabLayoutFooterView,
  LibroLabCurrentFileFooterView,
  LayoutService,
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
  createSlotPreference({
    slot: LibroLabLayoutSlots.footer,
    view: LibroLabLayoutFooterView,
  }),
  createSlotPreference({
    slot: FooterArea.right,
    view: FlexSlotView,
    options: { sort: true },
  }),
  createSlotPreference({
    slot: FooterArea.left,
    view: FlexSlotView,
    options: { sort: true },
  }),
  createSlotPreference({
    slot: FooterArea.left,
    view: LibroLabCurrentFileFooterView,
  }),
  LibroLabStatusFooterView,
  createSlotPreference({
    slot: FooterArea.right,
    view: LibroLabStatusFooterView,
  }),
);
