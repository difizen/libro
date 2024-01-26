import type { ConfigurationNode } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';

export const LibroConfigAutoSave: ConfigurationNode<boolean> = {
  id: 'libro.autosave',
  description: l10n.t('是否自动保存修改'),
  title: '自动保存',
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
  type: 'input',
  defaultValue: 'main',
  schema: {
    type: 'string',
  },
};

export const LibroConfigAllowDownload: ConfigurationNode<boolean> = {
  id: 'libro.jupyter.allow.download',
  description: '是否允许下载',
  title: '允许下载',
  type: 'checkbox',
  defaultValue: true,
  schema: {
    type: 'boolean',
  },
};

export const LibroConfigAllowUpload: ConfigurationNode<boolean> = {
  id: 'libro.jupyter.allow.upload',
  description: '是否允许上传',
  title: '允许上传',
  type: 'checkbox',
  defaultValue: true,
  schema: {
    type: 'boolean',
  },
};

export const LibroJupyterConfiguration = {
  AutoSave: LibroConfigAutoSave,
  OpenSlot: LibroConfigOpenSlot,
  AllowUpload: LibroConfigAllowUpload,
  AllowDownload: LibroConfigAllowDownload,
};
