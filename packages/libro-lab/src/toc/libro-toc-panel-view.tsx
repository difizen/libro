import { LibroNavigatableView } from '@difizen/libro-jupyter';
import { TOCView } from '@difizen/libro-toc';
import {
  BaseView,
  inject,
  prop,
  singleton,
  useInject,
  view,
  ViewInstance,
  ViewManager,
  ViewRender,
} from '@difizen/mana-app';
import { Empty } from 'antd';
import { TocIcon } from '../common/index.js';

import { LayoutService } from '../layout/layout-service.js';
import { LibroLabLayoutSlots } from '../layout/protocol.js';

import './index.less';

const TocViewRender: React.FC = () => {
  const tocPanelView = useInject<TocPanelView>(ViewInstance);
  return (
    <div className="libro-lab-toc-panel">
      {tocPanelView.libroTocView ? (
        <ViewRender view={tocPanelView.libroTocView}></ViewRender>
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
  @inject(ViewManager) protected viewManager: ViewManager;
  @inject(LayoutService) protected layoutService: LayoutService;
  @prop() libroTocView: TOCView | undefined;

  constructor() {
    super();
    this.title.icon = <TocIcon />;
    this.title.label = '大纲';
  }

  override onViewMount(): void {
    this.handleEditTabChange();
    this.layoutService.onSlotActiveChange(
      LibroLabLayoutSlots.content,
      this.handleEditTabChange,
    );
  }

  get libroNavigatableView() {
    const contentView = this.layoutService.getActiveView(LibroLabLayoutSlots.content);
    if (contentView instanceof LibroNavigatableView) {
      return contentView;
    }
    return undefined;
  }

  handleEditTabChange = () => {
    if (!this.libroNavigatableView) {
      return;
    }
    this.viewManager
      .getOrCreateView<TOCView>(TOCView, {
        id: this.libroNavigatableView.filePath,
      })
      .then((libroTocView) => {
        this.libroTocView = libroTocView;
        this.libroTocView.parent = this.libroNavigatableView?.libroView;
        return;
      })
      .catch(() => {
        //
      });
  };
}
