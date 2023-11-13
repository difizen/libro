import { singleton, Slot, view } from '@difizen/mana-app';
import { BaseView } from '@difizen/mana-app';
import { BoxPanel } from '@difizen/mana-react';
import { forwardRef } from 'react';

import './index.less';
import { LibroLabLayoutSlots } from './protocol.js';

export const LibroLabLayoutContainerComponent = forwardRef(
  function LibroLabLayoutContainerComponent() {
    return (
      <div className="libro-lab-layout">
        <BoxPanel direction="top-to-bottom">
          <BoxPanel.Pane className="libro-lab-layout-header">
            <Slot name={LibroLabLayoutSlots.header} />
          </BoxPanel.Pane>
          <BoxPanel.Pane className="libro-lab-layout-container" flex={1}>
            <Slot name={LibroLabLayoutSlots.container} />
          </BoxPanel.Pane>
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
