import { singleton, Slot, view } from '@difizen/mana-app';
import { BaseView } from '@difizen/mana-app';
import { SplitPanel } from '@difizen/mana-react';
import { forwardRef } from 'react';

import './index.less';
import { LibroLabLayoutSlots } from './protocol.js';

export const LibroLabLayoutMainComponent = forwardRef(
  function LibroLabLayoutMainComponent() {
    return (
      <SplitPanel id="libro-lab-content-layout">
        <SplitPanel.Pane
          id="libro-lab-content-layout-left"
          defaultSize={300}
          minResize={160}
        >
          <Slot name={LibroLabLayoutSlots.navigator} />
        </SplitPanel.Pane>
        <SplitPanel.Pane
          id="libro-lab-content-layout-main-container"
          flex={1}
          minResize={200}
        >
          <SplitPanel
            id="libro-lab-content-layout-main-panel"
            direction="top-to-bottom"
          >
            <SplitPanel.Pane
              id="libro-lab-content-layout-main"
              flex={2}
              flexGrow={1}
              minResize={200}
            >
              <Slot name={LibroLabLayoutSlots.content} />
            </SplitPanel.Pane>
            {/* <SplitPanel.Pane
              id="libro-lab-content-layout-bottom"
              flex={1}
              defaultSize={200}
            >
              <Slot name={LibroLabLayoutSlots.contentBottom} />
            </SplitPanel.Pane> */}
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
