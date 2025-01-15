import { singleton, Slot, view } from '@difizen/mana-app';
import { BaseView } from '@difizen/mana-app';
import { BoxPanel } from '@difizen/mana-react';
import { forwardRef } from 'react';

import './index.less';

export const LibroExecutionLayoutSlots = {
  header: 'libro-execution-header',
  content: 'libro-execution-content',
};

export const LibroExecutionLayoutComponent = forwardRef(
  function LibroExecutionLayoutComponent() {
    return (
      <div className="libro-execution-layout">
        <BoxPanel direction="top-to-bottom">
          <BoxPanel.Pane className="libro-lab-layout-header">
            <Slot name={LibroExecutionLayoutSlots.header} />
          </BoxPanel.Pane>
          <BoxPanel.Pane className="libro-lab-layout-container" flex={1}>
            <Slot name={LibroExecutionLayoutSlots.content} />
          </BoxPanel.Pane>
        </BoxPanel>
      </div>
    );
  },
);

@singleton()
@view('libro-execution-layout')
export class LibroExecutionLayoutView extends BaseView {
  override view = LibroExecutionLayoutComponent;
}
