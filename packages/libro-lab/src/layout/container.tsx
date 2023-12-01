import { singleton, Slot, view } from '@difizen/mana-app';
import { BaseView } from '@difizen/mana-app';
import { BoxPanel } from '@difizen/mana-react';
import { forwardRef } from 'react';

import './index.less';
import { LibroLabLayoutSlots } from './protocol.js';

export const LibroLabLayoutContainerComponent = forwardRef(
  function LibroLabLayoutContainerComponent() {
    return (
      <BoxPanel direction="top-to-bottom">
        <BoxPanel.Pane className="libro-lab-layout-main" flex={1}>
          <Slot name={LibroLabLayoutSlots.main} />
        </BoxPanel.Pane>
        <BoxPanel.Pane className="libro-lab-layout-bottom">
          <Slot name={LibroLabLayoutSlots.footer} />
        </BoxPanel.Pane>
      </BoxPanel>
    );
  },
);

@singleton()
@view('libro-lab-layout-container')
export class LibroLabLayoutContainerView extends BaseView {
  override view = LibroLabLayoutContainerComponent;
}
