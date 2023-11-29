import { BaseView, singleton, useInject, view, ViewRender } from '@difizen/mana-app';
import { Empty } from 'antd';

import { TocIcon } from './libro-toc-icons.js';
import { TocManager } from './libro-toc-manager.js';
import './index.less';

const TocViewRender: React.FC = () => {
  const tocManager = useInject(TocManager);
  return (
    <div className="libro-lab-toc-panel">
      {tocManager.libroTocView ? (
        <ViewRender view={tocManager.libroTocView}></ViewRender>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="该文件格式暂不支持大纲"
          className="libro-lab-toc-empty"
        />
      )}
    </div>
  );
};

export const TocViewFactoryId = 'libro-lab-toc-view';
@singleton()
@view(TocViewFactoryId)
export class TocPanelView extends BaseView {
  override view = TocViewRender;
  constructor() {
    super();
    this.title.icon = <TocIcon />;
    this.title.label = '大纲';
  }
}
