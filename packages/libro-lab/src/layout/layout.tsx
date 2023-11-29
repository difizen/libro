import { singleton, Slot, useInject, view } from '@difizen/mana-app';
import { BaseView } from '@difizen/mana-app';
import { BoxPanel } from '@difizen/mana-react';
import { forwardRef } from 'react';

import './index.less';
import { LayoutService } from './layout-service.js';
import { LibroLabLayoutSlots } from './protocol.js';

export const LibroLabLayoutContainerComponent = forwardRef(
  function LibroLabLayoutContainerComponent() {
    const layoutService = useInject(LayoutService);

    return (
      <div className="libro-lab-layout">
        <BoxPanel direction="top-to-bottom">
          {layoutService.isAreaVisible(LibroLabLayoutSlots.header) && (
            <BoxPanel.Pane className="libro-lab-layout-header">
              <Slot name={LibroLabLayoutSlots.header} />
            </BoxPanel.Pane>
          )}
          {layoutService.isAreaVisible(LibroLabLayoutSlots.container) && (
            <BoxPanel.Pane className="libro-lab-layout-container" flex={1}>
              <Slot name={LibroLabLayoutSlots.container} />
            </BoxPanel.Pane>
          )}
        </BoxPanel>
      </div>
    );
  },
);

@singleton()
@view('libro-lab-layout')
export class LibroLabLayoutView extends BaseView {
  override view = LibroLabLayoutContainerComponent;
}
