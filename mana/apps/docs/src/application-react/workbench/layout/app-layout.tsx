import { singleton } from '@difizen/mana-app';
import { Slot, DefaultSlotView, view } from '@difizen/mana-app';
import { BoxPanel } from '@difizen/mana-react';
import React from 'react';

import styles from './index.module.less';

export enum AppLayoutArea {
  header = 'header',
  content = 'content',
}

const BaseLayout: React.ForwardRefExoticComponent<any> = React.forwardRef(
  function BaseLayout(props, ref: React.ForwardedRef<any>) {
    return (
      <BoxPanel direction="top-to-bottom" className={styles.page} ref={ref}>
        <BoxPanel.Pane defaultSize={48}>
          <Slot name={AppLayoutArea.header} />
        </BoxPanel.Pane>
        <BoxPanel.Pane flex={1} className={styles.content}>
          <Slot name={AppLayoutArea.content} />
        </BoxPanel.Pane>
      </BoxPanel>
    );
  },
);

@singleton()
@view('app-layout')
export class AppLayoutView extends DefaultSlotView {
  override view = BaseLayout;
}
