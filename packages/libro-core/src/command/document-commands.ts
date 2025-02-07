import { SaveOutlined, SettingOutlined } from '@ant-design/icons';
import type { Command } from '@difizen/libro-common/mana-app';

import { FormatCellIcon } from '../material-from-designer.js';

export const DocumentCommands: Record<string, Command & { keybind?: string }> = {
  Save: {
    id: 'document:save',
    icon: SaveOutlined,
    label: 'SAVE',
    keybind: 'ctrlcmd+s',
  },
  OpenSettings: {
    id: 'document.notebook.open_setting',
    icon: SettingOutlined,
    label: 'Setting',
  },
  FormatCell: {
    id: 'document.notebook.format_cell',
    icon: FormatCellIcon,
    label: 'format cell code',
    keybind: 'shift+alt+f',
  },
};
