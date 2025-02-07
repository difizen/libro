import { BoxPanel } from '@difizen/libro-common/mana-react';
import {
  inject,
  singleton,
  Slot,
  useInject,
  view,
} from '@difizen/libro-common/mana-app';
import { BaseView } from '@difizen/libro-common/mana-app';
import { l10n } from '@difizen/libro-common/mana-l10n';
import { Alert } from 'antd';
import { forwardRef } from 'react';

import { Loadding } from '../common/icon.js';

import './index.less';
import type { VisibilityMap } from './layout-service.js';
import { LayoutService } from './layout-service.js';
import { LibroLabLayoutSlots } from './protocol.js';

export const LibroLabLayoutComponent = forwardRef(function LibroLabLayoutComponent() {
  const layoutService = useInject(LayoutService);

  return (
    <div className="libro-lab-layout" key={layoutService.refreshKey}>
      <BoxPanel direction="top-to-bottom">
        {layoutService.isAreaVisible(LibroLabLayoutSlots.header) && (
          <BoxPanel.Pane className="libro-lab-layout-header">
            <Slot name={LibroLabLayoutSlots.header} />
          </BoxPanel.Pane>
        )}
        {layoutService.isAreaVisible(LibroLabLayoutSlots.alert) && (
          <Alert
            message={l10n.t('服务启动中，请稍后，待服务启动完成后即可编辑文件。')}
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
});

@singleton()
@view('libro-lab-layout')
export class LibroLabLayoutView extends BaseView {
  override view = LibroLabLayoutComponent;

  @inject(LayoutService) layoutService: LayoutService;

  storeState(): object {
    return { visibilityMap: this.layoutService.visibilityMap };
  }

  restoreState(oldState: object): void {
    const state = oldState as { visibilityMap: VisibilityMap };
    this.layoutService.visibilityMap = {
      ...state.visibilityMap,
      [LibroLabLayoutSlots.navigator]: false,
      [LibroLabLayoutSlots.alert]: true,
    };
  }
}
