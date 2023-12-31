import { SaveOutlined, SettingOutlined } from '@ant-design/icons';
import type { Command } from '@difizen/mana-app';

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
};
