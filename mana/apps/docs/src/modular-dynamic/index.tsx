import type { Syringe } from '@difizen/mana-app';
import { ManaComponents, SlotViewManager, ViewManager } from '@difizen/mana-app';
import { HeaderArea } from '@difizen/mana-app';
import { ManaAppPreset } from '@difizen/mana-app';
import { Button } from 'antd';
import React, { useState } from 'react';

import { Content, ContentModule, Selector } from './content.js';
import { AppLayoutArea, LayoutModule } from './layout.js';

export default function Dynamic(): JSX.Element {
  const [ctx, setCTX] = useState<Syringe.Context | undefined>(undefined);
  const dynamicLoad = async () => {
    const container = ctx?.container;
    if (container) {
      container.load(ContentModule);
      const viewManager = container.get(ViewManager);
      const slotViewManager = container.get(SlotViewManager);
      const content = await viewManager.getOrCreateView(Content);
      slotViewManager.addView(content, AppLayoutArea.content);

      const selector = await viewManager.getOrCreateView(Selector);
      slotViewManager.addView(selector, HeaderArea.right);
    }
  };
  return (
    <div>
      <Button onClick={dynamicLoad}>加载并更新</Button>
      <ManaComponents.Application
        asChild={true}
        modules={[ManaAppPreset, LayoutModule]}
        onReady={(c) => {
          setCTX(c);
        }}
      />
    </div>
  );
}
