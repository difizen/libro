import type { ConfigurationNode } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';

export const LibroConfigAutoSave: ConfigurationNode<boolean> = {
  id: 'libro.autosave',
  description: l10n.t('是否自动保存修改'),
  title: 'checkbox',
  type: 'checkbox',
  defaultValue: false,
  schema: {
    type: 'boolean',
  },
};

export const LibroConfigOpenSlot: ConfigurationNode<string> = {
  id: 'libro.jupyter.open.slot',
  description: '文件默认打开位置',
  title: '文件默认打开位置',
  type: 'checkbox',
  defaultValue: 'main',
  schema: {
    type: 'string',
  },
};

export const LibroJupyterConfiguration = {
  AutoSave: LibroConfigAutoSave,
  OpenSlot: LibroConfigOpenSlot,
};
