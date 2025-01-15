/* eslint-disable @typescript-eslint/no-use-before-define */
import { singleton } from '@difizen/mana-app';
import { Slot, DefaultSlotView, view } from '@difizen/mana-app';
import { SplitPanel } from '@difizen/mana-react';
import React from 'react';

import styles from './index.module.less';

export enum WorkbenchLayoutArea {
  left = 'workbench-left',
  main = 'workbench-main',
  bottom = 'workbench-bottom',
  right = 'workbench-right',
}

const WorkbenchLayout = React.forwardRef(function WorkbenchLayout(
  props,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <SplitPanel id="workbench" className={styles.workbench} ref={ref}>
      <SplitPanel.Pane id="left" defaultSize={300} minResize={160}>
        <Slot name={WorkbenchLayoutArea.left} />
      </SplitPanel.Pane>
      <SplitPanel.Pane id="workbench-center" flex={1} minResize={200}>
        <SplitPanel id="center-split" direction="top-to-bottom">
          <SplitPanel.Pane id="main" flex={2} flexGrow={1} minResize={200}>
            <Slot name={WorkbenchLayoutArea.main} />
          </SplitPanel.Pane>
          <SplitPanel.Pane id="bottom" flex={1} defaultSize={200}>
            <Slot name={WorkbenchLayoutArea.bottom} />
          </SplitPanel.Pane>
        </SplitPanel>
      </SplitPanel.Pane>
      <SplitPanel.Pane id="right" defaultSize={200}>
        <Slot name={WorkbenchLayoutArea.right} />
      </SplitPanel.Pane>
    </SplitPanel>
  );
});

@singleton()
@view('base-layout')
export class WorkbenchLayoutView extends DefaultSlotView {
  override view = WorkbenchLayout;
}
