import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import * as React from 'react';

import { LayoutService } from '../layout-service.js';
import { LibroLabLayoutSlots } from '../protocol.js';
import './index.less';

const CurrentFileFooterComponent = React.forwardRef(function CurrentFileFooterComponent(
  _props,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const currentFileFooterView = useInject<LibroLabCurrentFileFooterView>(ViewInstance);

  return (
    <div className="libro-lab-current-file-footer" ref={ref}>
      <span>{`当前文件：${
        currentFileFooterView.navigatableView?.title.label || ''
      }`}</span>
    </div>
  );
});

@singleton()
@view('libro-lab-current-file-footer-view')
export class LibroLabCurrentFileFooterView extends BaseView {
  override view = CurrentFileFooterComponent;
  @inject(LayoutService) protected layoutService: LayoutService;

  get navigatableView() {
    const contentView = this.layoutService.getActiveView(LibroLabLayoutSlots.content);
    return contentView;
  }
}
