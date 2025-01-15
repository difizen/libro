/* eslint-disable max-len, @typescript-eslint/indent */

import type { MenuRegistry } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';
import { SETTINGS_MENU, MAIN_MENU_BAR } from '@difizen/mana-app';
import { MenuContribution } from '@difizen/mana-app';

import { CommonCommands } from '../command/common-command.js';

export namespace CommonMenus {
  export const SETTING = [...MAIN_MENU_BAR, '5_settings'];
  export const VIEW = [...MAIN_MENU_BAR, '4_view'];
  export const HELP = [...MAIN_MENU_BAR, '9_help'];

  export const SETTINGS_OPEN = [...SETTINGS_MENU, '1_settings_open'];
  export const SETTINGS__THEME = [...SETTINGS_MENU, '2_settings_theme'];
}

@singleton({ contrib: [MenuContribution] })
export class CommonMenu implements MenuContribution {
  registerMenus(menu: MenuRegistry) {
    menu.registerSubmenu(CommonMenus.HELP, { label: '帮助' });
    menu.registerSubmenu(CommonMenus.SETTING, { label: '设置' });
    menu.registerSubmenu(CommonMenus.VIEW, { label: '查看' });
    menu.registerMenuAction(CommonMenus.HELP, {
      id: CommonCommands.ABOUT_COMMAND.id,
      command: CommonCommands.ABOUT_COMMAND.id,
      label: '关于',
    });
  }
}
