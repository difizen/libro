import {
  PlusOutlined,
  MinusOutlined,
  MinusCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import type { Command, CommandRegistry, ToolbarRegistry } from '@difizen/mana-app';
import { CardTabView } from '@difizen/mana-app';
import { SlotView } from '@difizen/mana-app';
import { SlotViewManager } from '@difizen/mana-app';
import { ViewManager } from '@difizen/mana-app';
import {
  ApplicationContribution,
  ToolbarContribution,
  CommandContribution,
} from '@difizen/mana-app';
import { equals, getOrigin } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';

import { WorkbenchLayoutArea } from '../workbench/layout/workbench-layout.js';

import { CommandPaletteView, CommandSlot } from './command-palette-view.js';

export const INCREASE_COUNT: Command = {
  id: 'command.palette.increase',
  icon: PlusOutlined,
  label: 'INCREASE',
};

export const DECREACE_COUNT: Command = {
  id: 'command.palette.decreace',
  icon: MinusOutlined,
  label: 'DECREACE',
};

export const MOVE_VIEW: Command = {
  id: 'command.palette.move',
  icon: RightOutlined,
  label: '移动',
};

@singleton({
  contrib: [ApplicationContribution, CommandContribution, ToolbarContribution],
})
export class CommandPaletteApplication
  implements ApplicationContribution, CommandContribution, ToolbarContribution
{
  protected readonly viewManager: ViewManager;
  protected readonly slotViewManager: SlotViewManager;

  constructor(
    @inject(SlotViewManager) slotViewManager: SlotViewManager,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    this.viewManager = viewManager;
    this.slotViewManager = slotViewManager;
  }
  registerCommands(command: CommandRegistry): void {
    command.registerCommand(INCREASE_COUNT, {
      execute: async () => {
        const view =
          await this.viewManager.getView<CommandPaletteView>(CommandPaletteView);
        if (view) {
          view.count += 1;
        }
      },
      isVisible: (data: any, container: any) => {
        const view = this.slotViewManager.getSlotView(CommandSlot.first);
        return equals(view, container) && container instanceof CardTabView;
      },
    });
    command.registerHandler(INCREASE_COUNT.id, {
      execute: async () => {
        const view =
          await this.viewManager.getView<CommandPaletteView>(CommandPaletteView);
        if (view) {
          view.count += 1;
        }
      },
      isVisible: (data: any, container: any) => {
        const view = this.slotViewManager.getSlotView(CommandSlot.first);
        return (
          equals(view, container) &&
          container instanceof CardTabView &&
          container.children.length < 2
        );
      },
    });
    command.registerCommand(DECREACE_COUNT, {
      isVisible: (data: any) => data instanceof CommandPaletteView,
      isEnabled: (data: any) => data instanceof CommandPaletteView && data.count > 0,
      execute: async () => {
        const view =
          await this.viewManager.getView<CommandPaletteView>(CommandPaletteView);
        if (view) {
          view.count -= 1;
        }
      },
    });
    command.registerCommand(MOVE_VIEW, {
      isVisible: (data: any) => data instanceof CommandPaletteView && data.count > 0,
      isEnabled: (data: any) => data instanceof CommandPaletteView && data.count > 0,
      execute: async (data: CommandPaletteView) => {
        const view = getOrigin(data);
        if (view instanceof CommandPaletteView) {
          const rightView = this.slotViewManager.getSlotView(WorkbenchLayoutArea.right);
          const leftView = this.slotViewManager.getSlotView(WorkbenchLayoutArea.left);
          if (SlotView.is(leftView) && SlotView.is(rightView)) {
            if (leftView.contains(view)) {
              leftView.removeView(view);
              rightView.addView(view);
              return;
            }
            if (rightView.contains(view)) {
              rightView.removeView(view);
              leftView.addView(view);
              return;
            }
          }
        }
      },
    });
  }
  registerToolbarItems(registry: ToolbarRegistry): void {
    registry.registerItem({
      id: INCREASE_COUNT.id,
      command: INCREASE_COUNT.id,
      tooltip: '增加',
    });
    registry.registerItem({
      id: DECREACE_COUNT.id,
      command: DECREACE_COUNT.id,
      icon: MinusCircleOutlined,
    });
    registry.registerItem({
      id: MOVE_VIEW.id,
      command: MOVE_VIEW.id,
    });
    registry.registerItem({
      id: `${INCREASE_COUNT.id}-group`,
      command: INCREASE_COUNT.id,
      group: ['group1'],
    });
  }
  onStart() {
    //
  }
}
