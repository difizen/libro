import { BaseView, inject, singleton, useInject, view } from '@difizen/mana-app';
import * as React from 'react';
import { Loadding } from '../../common/icon.js';

import { LayoutService } from '../layout-service.js';
import { LibroLabLayoutSlots } from '../protocol.js';
import type { StatusItem, StatusType } from '../protocol.js';
import './index.less';

const Status: Record<StatusType, StatusItem> = {
  loading: {
    label: '启动中',
    icon: <Loadding />,
  },
  success: {
    label: '启动成功',
    icon: <Loadding />,
  },
};

const StatusFooterComponent = React.forwardRef(function CurrentFileFooterComponent(
  _props,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const layoutService = useInject(LayoutService);
  return (
    <div className="libro-lab-status-footer" ref={ref}>
      <span>服务状态：</span>
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
