/* eslint-disable max-len, @typescript-eslint/indent */

import {
  EyeInvisibleOutlined,
  EyeOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { CommandRegistry, MenuRegistry } from '@difizen/mana-app';
import {
  MAIN_MENU_BAR,
  MenuContribution,
  singleton,
  prop,
  CommandContribution,
} from '@difizen/mana-app';

@singleton()
export class Model {
  @prop()
  visible = false;
  @prop()
  enable = false;
}
export const Commands = {
  SHOW: {
    id: 'common.command.show',
    icon: EyeOutlined,
    label: '显示菜单项',
  },
  HIDE: {
    id: 'common.command.hide',
    icon: EyeInvisibleOutlined,
    label: '隐藏菜单项',
  },
  ENABLE: {
    id: 'common.command.enable',
    icon: CheckCircleOutlined,
    label: '激活菜单项',
  },
  DISABLE: {
    id: 'common.command.disable',
    icon: StopOutlined,
    label: '菜单项失效',
  },
};
export namespace CommonMenus {
  export const MAIN_MENU = [...MAIN_MENU_BAR, 'a_main_menu'];
  export const SUB = [...MAIN_MENU, 'a_main_submenu'];
  export const HELP = [...MAIN_MENU_BAR, 'b_help_menus'];
  export const TEST_GROUP = [...MAIN_MENU, 'b_test_group'];
  export const ACTION_GROUP = [...MAIN_MENU, 'c_action_group'];
  export const ENABLE_GROUP = [...MAIN_MENU, 'd_enable_group'];
}

@singleton({ contrib: [MenuContribution, CommandContribution] })
export class Menus implements MenuContribution, CommandContribution {
  registerCommands(command: CommandRegistry): void {
    command.registerCommand(Commands.SHOW, {
      execute: (model: Model) => {
        model.visible = true;
      },
    });
    command.registerCommand(Commands.HIDE, {
      execute: (model: Model) => {
        model.visible = false;
      },
      isVisible: (model: Model) => {
        return model.visible;
      },
    });
    command.registerCommand(Commands.ENABLE, {
      execute: (model: Model) => {
        model.enable = true;
      },
    });
    command.registerCommand(Commands.DISABLE, {
      execute: (model: Model) => {
        model.enable = false;
      },
      isEnabled: (model: Model) => {
        return model.enable;
      },
    });
  }
  registerMenus(menu: MenuRegistry) {
    menu.registerGroupMenu(CommonMenus.ACTION_GROUP, {});
    menu.registerGroupMenu(CommonMenus.ENABLE_GROUP, {});
    menu.registerGroupMenu(CommonMenus.TEST_GROUP, {});
    menu.registerSubmenu(CommonMenus.MAIN_MENU, { label: '主菜单' });
    menu.registerSubmenu(CommonMenus.SUB, { label: '子菜单' });
    menu.registerSubmenu(CommonMenus.HELP, { label: '帮助' });

    menu.registerMenuAction(CommonMenus.SUB, {
      id: Commands.ENABLE.id + 'sub',
      command: Commands.ENABLE.id,
    });
    menu.registerMenuAction(CommonMenus.SUB, {
      id: Commands.DISABLE.id + 'sub',
      command: Commands.DISABLE.id,
    });

    menu.registerMenuAction(CommonMenus.ACTION_GROUP, {
      id: Commands.SHOW.id + 'group',
      command: Commands.SHOW.id,
    });
    menu.registerMenuAction(CommonMenus.ACTION_GROUP, {
      id: Commands.HIDE.id + 'group',
      command: Commands.HIDE.id,
    });
    menu.registerMenuAction(CommonMenus.ENABLE_GROUP, {
      id: Commands.ENABLE.id + 'group',
      command: Commands.ENABLE.id,
    });
    menu.registerMenuAction(CommonMenus.ENABLE_GROUP, {
      id: Commands.DISABLE.id + 'group',
      command: Commands.DISABLE.id,
    });
  }
}
