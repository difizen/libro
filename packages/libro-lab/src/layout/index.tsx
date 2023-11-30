import { singleton, Slot, view } from '@difizen/mana-app';
import { BaseView } from '@difizen/mana-app';
import { BoxPanel, SplitPanel } from '@difizen/mana-react';
import { forwardRef } from 'react';

import './index.less';

export const LibroLabSlots = {
  top: 'libro-lab-top',
  bottom: 'libro-lab-bottom',
};
export const LibroLabContentSlots = {
  left: 'libro-lab-content-left',
  main: 'libro-lab-content-main',
  bottom: 'libro-lab-content-bottom',
};

export const LibroLabLayoutComponent = forwardRef(
  function LibroWorkbenchLayoutComponent() {
    return (
      <div className="libro-lab-layout">
        <BoxPanel direction="top-to-bottom">
          <BoxPanel.Pane className="libro-lab-layout-top">
            <Slot name={LibroLabSlots.top} />
          </BoxPanel.Pane>
          <BoxPanel.Pane className="libro-lab-layout-main">
            <SplitPanel id="libro-lab-content-layout">
              <SplitPanel.Pane
                id="libro-lab-content-layout-left"
                className="libro-lab-content-layout-left"
                defaultSize={300}
                minResize={160}
              >
                <Slot name={LibroLabContentSlots.left} />
              </SplitPanel.Pane>
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
                  <SplitPanel.Pane
                    id="libro-lab-content-layout-main"
                    className="libro-lab-content-layout-main"
                    flex={2}
                    flexGrow={1}
                    minResize={200}
                  >
                    <Slot name={LibroLabContentSlots.main} />
                  </SplitPanel.Pane>
                  <SplitPanel.Pane
                    id="libro-lab-content-layout-bottom"
                    className="libro-lab-content-layout-bottom"
                    flex={1}
                    defaultSize={200}
                  >
                    <Slot name={LibroLabContentSlots.bottom} />
                  </SplitPanel.Pane>
                </SplitPanel>
              </SplitPanel.Pane>
            </SplitPanel>
          </BoxPanel.Pane>
          <BoxPanel.Pane className="libro-lab-layout-bottom">
            <Slot name={LibroLabSlots.bottom} />
          </BoxPanel.Pane>
        </BoxPanel>
      </div>
    );
  },
);

@singleton()
@view('libro-lab-layout')
export class LibroLabLayoutView extends BaseView {
  override view = LibroLabLayoutComponent;
}
