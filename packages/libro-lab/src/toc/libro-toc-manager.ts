import { LibroNavigatableView } from '@difizen/libro-jupyter';
import { TOCView } from '@difizen/libro-toc';
import { inject, prop, singleton, ViewManager } from '@difizen/mana-app';

import { LayoutService } from '../layout/layout-service.js';
import { LibroLabLayoutSlots } from '../layout/protocol.js';

@singleton()
export class TocManager {
  protected viewManager: ViewManager;
  protected layoutService: LayoutService;
  @prop() libroTocView: TOCView | undefined;

  constructor(
    @inject(ViewManager) viewManager: ViewManager,
    @inject(LayoutService) layoutService: LayoutService,
  ) {
    this.viewManager = viewManager;
    this.layoutService = layoutService;
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
