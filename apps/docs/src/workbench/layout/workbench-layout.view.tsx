import { singleton, Slot, view } from '@difizen/libro-common/mana-app';
import { BaseView } from '@difizen/libro-common/mana-app';
import { BoxPanel } from '@difizen/libro-common/mana-react';
import { forwardRef } from 'react';

import './index.less';

export const LibroWorkbenchSlots = {
  Left: 'libro-workbench-left',
  Main: 'libro-workbench-main',
};

export const LibroWorkbenchLayoutComponent = forwardRef(
  function LibroWorkbenchLayoutComponent() {
    return (
      <div className="libro-workbench-layout">
        <BoxPanel direction="left-to-right">
          <BoxPanel.Pane className="libro-workbench-layout-left">
            <Slot name={LibroWorkbenchSlots.Left} />
          </BoxPanel.Pane>
          <BoxPanel.Pane className="libro-workbench-layout-main">
            <Slot name={LibroWorkbenchSlots.Main} />
          </BoxPanel.Pane>
        </BoxPanel>
      </div>
    );
  },
);

@singleton()
@view('libro-workbench-layout')
export class LibroWorkbenchLayoutView extends BaseView {
  override view = LibroWorkbenchLayoutComponent;
  routeParamValue = 'libro-editor-notebook';
}
