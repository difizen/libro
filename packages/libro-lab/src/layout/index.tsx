import { singleton, Slot, view } from '@difizen/mana-app';
import { BaseView } from '@difizen/mana-app';
import { BoxPanel } from '@difizen/mana-react';
import { forwardRef } from 'react';

import './index.less';

export const LibroLabSlots = {
  left: 'libro-lab-left',
  main: 'libro-lab-main',
};

export const LibroLabLayoutComponent = forwardRef(
  function LibroWorkbenchLayoutComponent() {
    return (
      <div className="libro-lab-layout">
        <BoxPanel direction="left-to-right">
          <BoxPanel.Pane className="libro-lab-layout-left">
            <Slot name={LibroLabSlots.left} />
          </BoxPanel.Pane>
          <BoxPanel.Pane className="libro-lab-layout-main">
            <Slot name={LibroLabSlots.main} />
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
