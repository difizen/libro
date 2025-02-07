import {
  LibroService,
  LibroJupyterConfiguration,
  ServerConnection,
  ServerManager,
} from '@difizen/libro-jupyter';
import { terminalDefaultSlot } from '@difizen/libro-terminal';
import type { FileTreeView } from '@difizen/libro-common/app';
import {
  ConfigurationService,
  FileTreeViewFactory,
  URI,
  ApplicationContribution,
  SlotViewManager,
  ViewManager,
  inject,
  singleton,
} from '@difizen/libro-common/app';

import { LibroLabConfiguration, LibroLabGuideViewEnabled } from './config/index.js';
import { GuideView } from './guide/index.js';
import { KernelAndTerminalPanelView } from './kernel-and-terminal-panel/index.js';
import { LibroLabLayoutSlots } from './layout/index.js';
import { LayoutService } from './layout/layout-service.js';
import { TocPanelView } from './toc/libro-toc-panel-view.js';

const ShouldPreventStoreViewKey = 'mana-should-prevent-store-view';

const leftPanelConfigs: Array<{
  configKey: keyof typeof LibroLabConfiguration;
  viewClass: any;
}> = [
  {
    configKey: 'LibroLabKernelAndTerminalPanelEnabled',
    viewClass: KernelAndTerminalPanelView,
  },
  { configKey: 'LibroLabTocPanelEnabled', viewClass: TocPanelView },
  // 可以在此处添加更多配置项
];
@singleton({ contrib: ApplicationContribution })
export class LibroLabApp implements ApplicationContribution {
  @inject(ServerConnection) serverConnection: ServerConnection;
  @inject(LibroService) libroService: LibroService;
  @inject(SlotViewManager) slotViewManager: SlotViewManager;
  @inject(ViewManager) viewManager: ViewManager;
  @inject(ConfigurationService) configurationService: ConfigurationService;
  @inject(ServerManager) serverManager: ServerManager;
  @inject(LayoutService) layoutService: LayoutService;

  async onStart() {
    localStorage.setItem(ShouldPreventStoreViewKey, 'true');
    this.configurationService.set(
      LibroJupyterConfiguration['OpenSlot'],
      LibroLabLayoutSlots.content,
    );
    this.configurationService.set(
      terminalDefaultSlot,
      LibroLabLayoutSlots.contentBottom,
    );

    for (const { configKey, viewClass } of leftPanelConfigs) {
      const isEnabled = await this.configurationService.get(
        LibroLabConfiguration[configKey],
      );
      if (isEnabled) {
        const view = await this.viewManager.getOrCreateView(viewClass);
        this.slotViewManager.addView(view, LibroLabLayoutSlots.navigator);
      }
    }
    this.serverManager.ready
      .then(async () => {
        this.layoutService.setAreaVisible(LibroLabLayoutSlots.navigator, true);
        this.layoutService.setAreaVisible(LibroLabLayoutSlots.alert, false);
        this.layoutService.serverSatus = 'success';
        this.initialWorkspace();
        const isGuideEnabled = await this.configurationService.get(
          LibroLabGuideViewEnabled,
        );
        if (isGuideEnabled) {
          const view = await this.viewManager.getOrCreateView(GuideView);
          this.slotViewManager.addView(view, LibroLabLayoutSlots.content);
        }
        return;
      })
      .catch(console.error);
  }

  protected async initialWorkspace() {
    const view =
      await this.viewManager.getOrCreateView<FileTreeView>(FileTreeViewFactory);
    if (view) {
      view.model.rootVisible = false;
      view.model.location = new URI('/');
    }
  }
}
