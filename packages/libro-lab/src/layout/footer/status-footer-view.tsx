import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
} from '@difizen/libro-common/mana-app';
import { l10n } from '@difizen/libro-common/l10n';
import * as React from 'react';

import { Loadding, SuccIcon } from '../../common/icon.js';
import { LayoutService } from '../layout-service.js';
import { LibroLabLayoutSlots } from '../protocol.js';
import type { StatusItem, StatusType } from '../protocol.js';
import './index.less';

const StatusFooterComponent = React.forwardRef(function CurrentFileFooterComponent(
  _props,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const layoutService = useInject(LayoutService);
  const Status: Record<StatusType, StatusItem> = {
    loading: {
      label: l10n.t('启动中'),
      icon: <Loadding />,
    },
    success: {
      label: l10n.t('启动成功'),
      icon: <SuccIcon />,
    },
  };
  return (
    <div className="libro-lab-status-footer" ref={ref}>
      <span>{l10n.t('服务状态：')}</span>
      {Status[layoutService.serverSatus].icon}
      {Status[layoutService.serverSatus].label}
    </div>
  );
});

@singleton()
@view('libro-lab-status-footer-view')
export class LibroLabStatusFooterView extends BaseView {
  override view = StatusFooterComponent;
  @inject(LayoutService) protected layoutService: LayoutService;

  get navigatableView() {
    const contentView = this.layoutService.getActiveView(LibroLabLayoutSlots.content);
    return contentView;
  }
}
