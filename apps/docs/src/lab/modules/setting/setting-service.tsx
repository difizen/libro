import { LibroLabLayoutSlots } from '@difizen/libro-lab';
import type { CommandRegistry, ToolbarRegistry } from '@difizen/mana-app';
import { SlotViewManager, ViewManager } from '@difizen/mana-app';
import {
  CommandContribution,
  ModalService,
  SideTabView,
  ToolbarContribution,
} from '@difizen/mana-app';
import { Deferred } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';
import { SettingEditorView } from '@difizen/mana-configuration-panel';

import { SideSettingCommand } from './setting-modal.js';

export interface StoragetItem {
  cluster: string;
  subPath?: string;
  mountPath?: string;
}
export interface CandidateInfo {
  nasStorageInfos?: StoragetItem[];
  appNames?: string[];
  gpuTypes?: string[];
}

@singleton({ contrib: [ToolbarContribution, CommandContribution] })
export class SettingsService implements ToolbarContribution, CommandContribution {
  @inject(ModalService) protected readonly modalService: ModalService;
  @inject(ViewManager) viewManager: ViewManager;
  @inject(SlotViewManager) slotManager: SlotViewManager;

  registerCommands(commands: CommandRegistry) {
    commands.registerCommand(SideSettingCommand, {
      isEnabled: (data) => {
        return data instanceof SideTabView;
      },
      isVisible: (data) => {
        return data instanceof SideTabView;
      },
      execute: async () => {
        // todo 打开设置页面
        const view = await this.viewManager.getOrCreateView(SettingEditorView);
        await this.slotManager.addView(view, LibroLabLayoutSlots.content);
        // this.modalService.openModal(SettingModal);
      },
    });
  }

  registerToolbarItems(registry: ToolbarRegistry) {
    registry.registerItem({
      ...SideSettingCommand,
      command: SideSettingCommand.id,
      order: '2',
    });
  }

  ready: Promise<void>;

  protected readyDeferred = new Deferred<void>();

  constructor() {
    this.ready = this.readyDeferred.promise;
  }
}
