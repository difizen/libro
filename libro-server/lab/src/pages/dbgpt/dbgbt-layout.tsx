import { singleton, Slot, useInject, view } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { LayoutService, LibroLabLayoutSlots, LibroLabLayoutView, Loadding } from '@difizen/libro-lab'
import { BoxPanel } from '@difizen/mana-react';
import { Alert } from 'antd';
import { forwardRef } from 'react';


export const LibroDbgptLayoutComponent = forwardRef(function LibroLabLayoutComponent() {
  const layoutService = useInject(LayoutService);
  return (
    <div className="libro-lab-layout" key={layoutService.refreshKey}>
      <BoxPanel direction="top-to-bottom">
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
export class LibroDbgptLayoutView extends LibroLabLayoutView {
  override view = LibroDbgptLayoutComponent;

}
