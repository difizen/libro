import { CodeFilled } from '@ant-design/icons';
import { singleton, view } from '@difizen/mana-app';
import { BaseView } from '@difizen/mana-app';
import { l10n } from '@difizen/libro-common/mana-l10n';
import { forwardRef } from 'react';

// import './index.less';

export const KernelManagerComponent = forwardRef(function KernelManagerComponent() {
  return <span>{l10n.t('暂无文件')}</span>;
});

@singleton()
@view('kernel-manager')
export class KernelManagerView extends BaseView {
  override view = KernelManagerComponent;

  constructor() {
    super();
    this.title.icon = <CodeFilled />;
    this.title.label = () => <div>{l10n.t('Kernel 管理')}</div>;
  }
}
