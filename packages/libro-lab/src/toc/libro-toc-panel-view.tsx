import { LibroNavigatableView } from '@difizen/libro-jupyter';
import { TOCView } from '@difizen/libro-toc';
import {
  BaseView,
  inject,
  prop,
  singleton,
  ThemeService,
  useInject,
  view,
  ViewInstance,
  ViewManager,
  ViewRender,
} from '@difizen/libro-common/mana-app';
import { l10n } from '@difizen/libro-common/l10n';
import { ConfigProvider, Empty, theme } from 'antd';

import { TocIcon } from '../common/index.js';
import { LayoutService } from '../layout/layout-service.js';
import { LibroLabLayoutSlots } from '../layout/protocol.js';

import './index.less';

const TocViewRender: React.FC = () => {
  const tocPanelView = useInject<TocPanelView>(ViewInstance);
  const themeService = useInject<ThemeService>(ThemeService);
  return (
    <ConfigProvider
      theme={{
        algorithm:
          themeService.getCurrentTheme().type === 'dark'
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
      <div className="libro-lab-toc-panel">
        {tocPanelView.libroTocView ? (
          <ViewRender view={tocPanelView.libroTocView}></ViewRender>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={l10n.t('该文件格式暂不支持大纲')}
            className="libro-lab-toc-empty"
          />
        )}
      </div>
    </ConfigProvider>
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
    this.title.label = () => <div>{l10n.t('大纲')}</div>;
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
      this.libroTocView = undefined;
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
