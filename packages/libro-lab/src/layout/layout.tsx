import { inject, singleton, Slot, useInject, view } from '@difizen/mana-app';
import { BaseView } from '@difizen/mana-app';
import { BoxPanel } from '@difizen/mana-react';
import { Alert } from 'antd';
import { forwardRef } from 'react';

import { Loadding } from '../common/icon.js';

import './index.less';
import type { VisibilityMap } from './layout-service.js';
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
          {layoutService.isAreaVisible(LibroLabLayoutSlots.alert) && (
            <Alert
              message="服务启动中，请稍后，待容器启动完成后即可编辑文件。"
              type="info"
              banner
              closable
              icon={<Loadding className="libro-lab-loadding" />}
            />
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

  @inject(LayoutService) layoutService: LayoutService;

  storeState(): object {
    return { visibilityMap: this.layoutService.visibilityMap };
  }

  restoreState(oldState: object): void {
    const state = oldState as { visibilityMap: VisibilityMap };
    this.layoutService.visibilityMap = state.visibilityMap;
  }
}
