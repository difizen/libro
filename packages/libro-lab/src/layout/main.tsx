import { singleton, Slot, useInject, view } from '@difizen/mana-app';
import { BaseView } from '@difizen/mana-app';
import { SplitPanel } from '@difizen/mana-react';
import { forwardRef } from 'react';

import './index.less';
import { LayoutService } from './layout-service.js';
import { LibroLabLayoutSlots } from './protocol.js';

export const LibroLabLayoutMainComponent = forwardRef(
  function LibroLabLayoutMainComponent() {
    const layoutService = useInject(LayoutService);
    const navigatorSize = layoutService.shouldRenderNavigatorContent()
      ? {
          minSize: 40,
          defaultSize: 300,
          maxSize: undefined,
        }
      : {
          minSize: 40,
          defaultSize: 40,
          maxSize: 40,
          noResize: true,
        };

    return (
      <SplitPanel id="libro-lab-content-layout">
        {layoutService.isAreaVisible(LibroLabLayoutSlots.navigator) && (
          <SplitPanel.Pane
            id="libro-lab-content-layout-left"
            className="libro-lab-content-layout-left"
            {...navigatorSize}
          >
            <Slot name={LibroLabLayoutSlots.navigator} />
          </SplitPanel.Pane>
        )}
        <SplitPanel.Pane
          id="libro-lab-content-layout-main-container"
          className="libro-lab-content-layout-main-container"
          flex={1}
          minResize={200}
        >
          <SplitPanel
            id="libro-lab-content-layout-main-panel"
            direction="top-to-bottom"
          >
            {layoutService.isAreaVisible(LibroLabLayoutSlots.content) && (
              <SplitPanel.Pane
                id="libro-lab-content-layout-main"
                className="libro-lab-content-layout-main"
                flex={2}
                flexGrow={1}
                minResize={200}
              >
                <Slot name={LibroLabLayoutSlots.content} />
              </SplitPanel.Pane>
            )}
            {layoutService.isAreaVisible(LibroLabLayoutSlots.contentBottom) && (
              <SplitPanel.Pane
                id="libro-lab-content-layout-bottom"
                className="libro-lab-content-layout-bottom"
                flex={1}
                defaultSize={200}
              >
                <Slot name={LibroLabLayoutSlots.contentBottom} />
              </SplitPanel.Pane>
            )}
          </SplitPanel>
        </SplitPanel.Pane>
      </SplitPanel>
    );
  },
);

@singleton()
@view('libro-lab-layout-main')
export class LibroLabLayoutMainView extends BaseView {
  override view = LibroLabLayoutMainComponent;
}
