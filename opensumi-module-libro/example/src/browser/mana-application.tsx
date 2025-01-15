import { LibroJupyterNoEditorModule } from '@difizen/libro-jupyter';
import { LibroSqlCellModule } from '@difizen/libro-sql-cell';
import { LibroTOCModule } from '@difizen/libro-toc';
import {
  GlobalContainer,
  ManaAppPreset,
  ManaComponents,
} from '@difizen/mana-app';
import { SlotRenderer } from '@opensumi/ide-core-browser';
import {
  BoxPanel,
  getStorageValue,
  SplitPanel,
} from '@opensumi/ide-core-browser/lib/components';

import { DemoLibroModule } from './mana/demo-module';

export const manaContainer = GlobalContainer.createChild();

export function CustomToolbarLayout() {
  const { colors, layout } = getStorageValue();
  return (
    <BoxPanel direction="top-to-bottom">
      <ManaComponents.Application
        context={{ container: manaContainer }}
        modules={[
          ManaAppPreset,
          LibroJupyterNoEditorModule,
          DemoLibroModule,
          LibroTOCModule,
          LibroSqlCellModule,
        ]}
        renderChildren
      />
      <SlotRenderer
        backgroundColor={colors.menuBarBackground}
        defaultSize={0}
        slot="top"
        z-index={2}
      />
      <SplitPanel id="main-horizontal" flex={1}>
        <SlotRenderer
          backgroundColor={colors.sideBarBackground}
          slot="left"
          isTabbar={true}
          defaultSize={layout.left?.currentId ? layout.left?.size || 310 : 49}
          minResize={204}
          minSize={49}
        />
        <SplitPanel
          id="main-vertical"
          minResize={300}
          flexGrow={1}
          direction="top-to-bottom"
        >
          <SlotRenderer
            backgroundColor={colors.editorBackground}
            flex={2}
            flexGrow={1}
            minResize={200}
            slot="main"
          />
          <SlotRenderer
            backgroundColor={colors.panelBackground}
            flex={1}
            defaultSize={layout.bottom?.size}
            minResize={160}
            slot="bottom"
            isTabbar={true}
          />
        </SplitPanel>
        <SlotRenderer
          backgroundColor={colors.sideBarBackground}
          slot="right"
          isTabbar={true}
          defaultSize={layout.right?.currentId ? layout.right?.size || 310 : 0}
          minResize={200}
          minSize={0}
        />
      </SplitPanel>
      <SlotRenderer
        backgroundColor={colors.statusBarBackground}
        defaultSize={24}
        slot="statusBar"
      />
    </BoxPanel>
  );
}
