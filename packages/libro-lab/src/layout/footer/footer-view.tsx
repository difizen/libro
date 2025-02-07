import { BoxPanel } from '@difizen/libro-common/mana-react';
import { DefaultSlotView, singleton, Slot, view } from '@difizen/mana-app';
import * as React from 'react';
import './index.less';

export enum FooterArea {
  left = 'libro-lab-footer-left',
  right = 'libro-lab-footer-right',
}

const FooterComponent: React.ForwardRefExoticComponent<any> = React.forwardRef(
  function FooterComponent(_props, ref: React.ForwardedRef<HTMLDivElement>) {
    return (
      <BoxPanel direction="left-to-right" className={'libro-lab-footer'} ref={ref}>
        <BoxPanel.Pane flex={1} className={'libro-lab-footer-left'}>
          <Slot name={FooterArea.left} />
        </BoxPanel.Pane>
        <BoxPanel.Pane flex={1} className={'libro-lab-footer-right'}>
          <Slot name={FooterArea.right} />
        </BoxPanel.Pane>
      </BoxPanel>
    );
  },
);

@singleton()
@view('libro-lab-footer-view')
export class LibroLabLayoutFooterView extends DefaultSlotView {
  override view = FooterComponent;
}
