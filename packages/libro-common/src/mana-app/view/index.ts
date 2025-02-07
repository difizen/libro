import { TabSlotView, SideTabView, CardTabView } from './tab';
import { BoxSlotView } from './box';
import { ManaModule } from '@difizen/mana-core';
import { FlexSlotView } from './flex';
import { HeaderModule } from './header';

export * from './components';
export * from './box';
export * from './tab';
export * from './flex';
export * from './header';

export const DefaultViewModule = ManaModule.create()
  .register(TabSlotView, SideTabView, CardTabView, BoxSlotView, FlexSlotView)
  .dependOn(HeaderModule);
