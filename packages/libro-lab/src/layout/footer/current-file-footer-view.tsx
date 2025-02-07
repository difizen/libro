import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/libro-common/mana-app';
import { l10n } from '@difizen/libro-common/l10n';
import * as React from 'react';

import { LayoutService } from '../layout-service.js';
import { LibroLabLayoutSlots } from '../protocol.js';
import './index.less';

const CurrentFileFooterComponent = React.forwardRef(function CurrentFileFooterComponent(
  _props,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const currentFileFooterView = useInject<LibroLabCurrentFileFooterView>(ViewInstance);
  const label = currentFileFooterView.navigatableView?.title.label;
  return (
    <div className="libro-lab-current-file-footer" ref={ref}>
      <span>{l10n.t('当前文件：')}</span>
      {
        typeof label === 'function'
          ? React.createElement(label) // 如果是 React.FC，调用它
          : label /* 如果是 ReactNode，直接渲染 */
      }
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
