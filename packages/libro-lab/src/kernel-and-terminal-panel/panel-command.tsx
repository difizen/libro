import { ReloadOutlined } from '@ant-design/icons';
import type { CommandRegistry, ToolbarRegistry } from '@difizen/libro-common/mana-app';
import { ViewManager } from '@difizen/libro-common/mana-app';
import {
  CommandContribution,
  inject,
  singleton,
  ToolbarContribution,
} from '@difizen/libro-common/mana-app';
import { l10n } from '@difizen/libro-common/l10n';

import { KernelAndTerminalPanelView } from './kernel-and-terminal-panel-view.js';

export const PanelCommand = {
  REFRESH: {
    id: 'panel.command.refresh',
    label: l10n.t('刷新'),
  },
};

@singleton({
  contrib: [CommandContribution, ToolbarContribution],
})
export class PanelCommandContribution
  implements CommandContribution, ToolbarContribution
{
  protected viewManager: ViewManager;

  @inject(KernelAndTerminalPanelView)
  kernelAndTerminalPanelView: KernelAndTerminalPanelView;

  constructor(@inject(ViewManager) viewManager: ViewManager) {
    this.viewManager = viewManager;
  }

  registerCommands(command: CommandRegistry): void {
    command.registerCommand(PanelCommand.REFRESH, {
      execute: async (view) => {
        if (view instanceof KernelAndTerminalPanelView) {
          this.kernelAndTerminalPanelView.refresh();
        }
      },
      isVisible: (view) => {
        return view instanceof KernelAndTerminalPanelView;
      },
    });
  }

  registerToolbarItems(toolbarRegistry: ToolbarRegistry): void {
    toolbarRegistry.registerItem({
      id: PanelCommand.REFRESH.id,
      command: PanelCommand.REFRESH.id,
      icon: <ReloadOutlined />,
      tooltip: l10n.t('刷新'),
    });
  }
}
